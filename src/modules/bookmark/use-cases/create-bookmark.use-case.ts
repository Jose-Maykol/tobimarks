import { parse } from 'tldts'
import { inject, injectable, container } from 'tsyringe'

import { COLLECTION_REPOSITORY } from '../../collection/di/token'
import type { ICollectionRepository } from '../../collection/repositories/collection.repository'
import { BOOKMARK_REPOSITORY, WEBSITE_REPOSITORY, METADATA_EXTRACTOR_SERVICE } from '../di/token'
import { BookmarkAlreadyExistsError } from '../exceptions/bookmark.exceptions'
import type { CreateBookmarkDto } from '../models/bookmark.model'
import type { IBookmarkRepository } from '../repositories/bookmark.repository'
import type { IWebsiteRepository } from '../repositories/websites.repository'
import type { MetadataExtractorService } from '../services/metadata-extractor.service'
import type { CreateBookmarkRequestBody } from '../types/bookmark.types'

import { UniqueConstraintViolationError } from '@/core/database/database.exceptions'
import type { IUnitOfWork } from '@/core/database/unit-of-work'
import { UNIT_OF_WORK, LOGGER, QUEUE_SERVICE } from '@/core/di/tokens'
import type { ILogger } from '@/core/logger/logger'
import type { IQueueService } from '@/core/queue/queue.service'
import type { AccessTokenPayload } from '@/modules/auth/types/auth.types'
import { USER_SERVICE } from '@/modules/user/di/tokens'
import type { UserService } from '@/modules/user/services/user.service'

/**
 * Caso de uso encargado de la creación de nuevos marcadores.
 * Extrae metadatos de la URL, gestiona la asociación con sitios web y colecciones,
 * y encola tareas de procesamiento de IA si es necesario.
 */
@injectable()
export class CreateBookmarkUseCase {
	private readonly logger: ILogger

	constructor(
		@inject(BOOKMARK_REPOSITORY) private bookmarkRepository: IBookmarkRepository,
		@inject(METADATA_EXTRACTOR_SERVICE) private metadataExtractor: MetadataExtractorService,
		@inject(WEBSITE_REPOSITORY) private websiteRepository: IWebsiteRepository,
		@inject(COLLECTION_REPOSITORY) private collectionRepository: ICollectionRepository,
		@inject(USER_SERVICE) private userService: UserService,
		@inject(QUEUE_SERVICE) private queueService: IQueueService,
		@inject(LOGGER) logger: ILogger
	) {
		this.logger = logger.child({ context: 'CreateBookmarkUseCase' })
	}

	/**
	 * Ejecuta la creación de un marcador.
	 * Realiza la extracción de metadatos, normalización de URL y gestión de base de datos dentro de una transacción.
	 *
	 * @param user - Información del usuario autenticado.
	 * @param data - Datos necesarios para crear el marcador (URL, colección opcional).
	 * @returns Una promesa que se resuelve con el marcador creado.
	 * @throws BookmarkAlreadyExistsError - Si el marcador ya existe para el usuario.
	 */
	async execute(user: AccessTokenPayload, data: CreateBookmarkRequestBody) {
		this.logger.info('Creating new bookmark', { userId: user.sub, url: data.url })
		const urlBookmark = data.url

		const metadata = await this.metadataExtractor.extractFromUrl(urlBookmark)

		const { title, description, ogTitle, ogImageUrl, ogDescription, faviconUrl, canonicalUrl } =
			metadata

		const unitOfWork = container.resolve<IUnitOfWork>(UNIT_OF_WORK)
		await unitOfWork.begin()
		try {
			const website = await this.findOrCreateWebsite(urlBookmark, faviconUrl, unitOfWork)

			const newBookmark: CreateBookmarkDto = {
				userId: user.sub,
				websiteId: website.id,
				collectionId: data.collectionId ?? null,
				url: this.normalizeUrl(urlBookmark, canonicalUrl),
				title: title,
				description: description,
				ogTitle: ogTitle,
				ogDescription: ogDescription,
				ogImageUrl: ogImageUrl,
				isFavorite: false,
				isArchived: false
			}

			const createdBookmark = await this.bookmarkRepository.create(newBookmark, unitOfWork)

			if (data.collectionId) {
				await this.collectionRepository.updateBookmarkCount(data.collectionId, 1, unitOfWork)
			}

			await unitOfWork.commit()
			this.logger.info('Bookmark created successfully', { bookmarkId: createdBookmark.id })

			try {
				const userProfile = await this.userService.getProfile(user.sub)
				if (userProfile?.settings?.aiAutoTags) {
					await this.queueService.addJob(
						'ai-tags-generation',
						'generate-tags',
						{
							bookmarkId: createdBookmark.id,
							userId: user.sub
						},
						{
							attempts: 3,
							backoff: { type: 'exponential', delay: 2000 }
						}
					)
					this.logger.info('AI auto-tags job enqueued successfully', {
						bookmarkId: createdBookmark.id,
						userId: user.sub
					})
				}

				if (userProfile?.settings?.aiAutoCollections && !data.collectionId) {
					await this.queueService.addJob(
						'ai-collections-generation',
						'generate-collections',
						{
							bookmarkId: createdBookmark.id,
							userId: user.sub
						},
						{
							attempts: 3,
							backoff: { type: 'exponential', delay: 2000 }
						}
					)
					this.logger.info('AI auto-collections job enqueued successfully', {
						bookmarkId: createdBookmark.id,
						userId: user.sub
					})
				}
			} catch (queueError) {
				this.logger.error('Failed to enqueue AI auto-tags job', {
					bookmarkId: createdBookmark.id,
					error: queueError instanceof Error ? queueError.message : String(queueError)
				})
			}

			return createdBookmark
		} catch (error) {
			await unitOfWork.rollback()
			if (error instanceof UniqueConstraintViolationError) {
				this.logger.warn('Bookmark already exists', { userId: user.sub, url: data.url })
				throw new BookmarkAlreadyExistsError()
			}
			this.logger.error('Error creating bookmark', { error })
			throw error
		}
	}

	private async findOrCreateWebsite(
		url: string,
		faviconUrl: string | null,
		queryRunner?: IUnitOfWork
	) {
		const urlParse = parse(url)
		const domain = urlParse.domain as string
		const domainWithoutSuffix = urlParse.domainWithoutSuffix as string

		const website = await this.websiteRepository.findByDomain(domain, queryRunner)

		if (!website) {
			this.logger.info('Website not found, creating new one', { domain })
			const newWebsite = await this.websiteRepository.create(
				{
					domain,
					name: domainWithoutSuffix,
					faviconUrl: faviconUrl
				},
				queryRunner
			)
			return newWebsite
		}

		return website
	}

	private normalizeUrl(originalUrl: string, canonicalUrl: string | null): string {
		if (!canonicalUrl) return originalUrl

		try {
			const original = new URL(originalUrl)
			const canonical = new URL(canonicalUrl)

			if (original.hostname !== canonical.hostname) return originalUrl

			if (original.pathname === canonical.pathname) return canonicalUrl

			return canonicalUrl
		} catch {
			return originalUrl
		}
	}
}
