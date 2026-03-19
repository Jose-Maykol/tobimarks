import { parse } from 'tldts'
import { inject, injectable, container } from 'tsyringe'

import type { MetadataExtractorService } from './metadata-extractor.service'
import type { TagService } from './tag.service'
import { COLLECTION_REPOSITORY, COLLECTION_SERVICE } from '../../collection/di/token'
import type { ICollectionRepository } from '../../collection/repositories/collection.repository'
import type { CollectionService } from '../../collection/services/collection.service'
import {
	BOOKMARK_REPOSITORY,
	METADATA_EXTRACTOR_SERVICE,
	TAG_SERVICE,
	WEBSITE_REPOSITORY
} from '../di/token'
import {
	BookmarkAlreadyExistsError,
	BookmarkNotFoundError
} from '../exceptions/bookmark.exceptions'
import type {
	BookmarkFilters,
	CreateBookmarkDto,
	UpdateBookmarkDto
} from '../models/bookmark.model'
import type { IBookmarkRepository } from '../repositories/bookmark.repository'
import type { IWebsiteRepository } from '../repositories/websites.repository'
import type { CreateBookmarkRequestBody, UpdateBookmarkRequestBody } from '../types/bookmark.types'

import type { PaginationOptions } from '@/common/types/pagination.type'
import { UniqueConstraintViolationError } from '@/core/database/database.exceptions'
import type { IUnitOfWork } from '@/core/database/unit-of-work'
import { UNIT_OF_WORK, LOGGER, QUEUE_SERVICE } from '@/core/di/tokens'
import type { ILogger } from '@/core/logger/logger'
import type { IQueueService } from '@/core/queue/queue.service'
import type { AccessTokenPayload } from '@/modules/auth/types/auth.types'
import { USER_SERVICE } from '@/modules/user/di/tokens'
import type { UserService } from '@/modules/user/services/user.service'

/**
 * Servicio encargado de la gestión de marcadores (bookmarks).
 * Proporciona funcionalidad para crear, obtener, actualizar, eliminar y organizar marcadores,
 * además de gestionar favoritos y asociaciones con colecciones y etiquetas.
 */
@injectable()
export class BookmarkService {
	private readonly logger: ILogger

	constructor(
		@inject(BOOKMARK_REPOSITORY) private bookmarkRepository: IBookmarkRepository,
		@inject(METADATA_EXTRACTOR_SERVICE) private metadataExtractor: MetadataExtractorService,
		@inject(WEBSITE_REPOSITORY) private websiteRepository: IWebsiteRepository,
		@inject(TAG_SERVICE) private tagService: TagService,
		@inject(COLLECTION_REPOSITORY) private collectionRepository: ICollectionRepository,
		@inject(COLLECTION_SERVICE) private collectionService: CollectionService,
		@inject(USER_SERVICE) private userService: UserService,
		@inject(QUEUE_SERVICE) private queueService: IQueueService,
		@inject(LOGGER) logger: ILogger
	) {
		this.logger = logger.child({ context: 'BookmarkService' })

		this.queueService.registerQueue('ai-tags-generation', async (job) => {
			const { bookmarkId, userId } = job.data as { bookmarkId: string; userId: string }
			this.logger.info('Processing AI auto-tags generation job', { bookmarkId, userId })

			try {
				const userTags = await this.tagService.getByUserId(userId)

				if (userTags.length === 0) {
					this.logger.info('User has no tags to match against. AI tags generation skipped.', {
						userId
					})
					return { success: true, message: 'User has no tags' }
				}

				const bookmark = await this.bookmarkRepository.findById(bookmarkId)
				if (!bookmark) {
					this.logger.warn('Bookmark not found. AI tags generation skipped.', { bookmarkId })
					return { success: false, message: 'Bookmark not found' }
				}

				const textParts = [
					bookmark.title,
					bookmark.description,
					bookmark.ogTitle,
					bookmark.ogDescription
				].filter((part): part is string => typeof part === 'string' && part.trim().length > 0)

				if (textParts.length === 0) {
					this.logger.info(
						'Bookmark has no textual content to analyze. AI auto-tags generation skipped.',
						{ bookmarkId }
					)
					return { success: true, message: 'No textual content to analyze' }
				}

				const textToAnalyze = textParts.join(' ')
				const similarTagIds = await this.tagService.findSimilarTagsForText(
					userId,
					textToAnalyze,
					0.7
				)

				if (similarTagIds.length > 0) {
					await this.bookmarkRepository.update(bookmarkId, { tags: similarTagIds })
					this.logger.info('AI auto-tags assigned successfully', {
						bookmarkId,
						tagsCount: similarTagIds.length
					})
				} else {
					this.logger.info('No similar tags found for AI auto-tags', { bookmarkId })
				}

				return { success: true, tagsAssigned: similarTagIds.length }
			} catch (error) {
				this.logger.error('Error during AI auto-tags generation', {
					bookmarkId,
					userId,
					error: error instanceof Error ? error.message : String(error)
				})
				throw error
			}
		})

		this.queueService.registerQueue('ai-collections-generation', async (job) => {
			const { bookmarkId, userId } = job.data as { bookmarkId: string; userId: string }
			this.logger.info('Processing AI auto-collections generation job', { bookmarkId, userId })

			try {
				const userCollections = await this.collectionService.get(
					{ sub: userId } as AccessTokenPayload,
					{ page: 1, limit: 1 }
				)

				if (userCollections.meta.total === 0) {
					this.logger.info(
						'User has no collections to match against. AI collections generation skipped.',
						{ userId }
					)
					return { success: true, message: 'User has no collections' }
				}

				const bookmark = await this.bookmarkRepository.findById(bookmarkId)
				if (!bookmark) {
					this.logger.warn('Bookmark not found. AI collections generation skipped.', { bookmarkId })
					return { success: false, message: 'Bookmark not found' }
				}

				if (bookmark.collectionId) {
					this.logger.info(
						'Bookmark already has a collection. AI collections generation skipped.',
						{ bookmarkId }
					)
					return { success: true, message: 'Bookmark already in a collection' }
				}

				const textParts = [
					bookmark.title,
					bookmark.description,
					bookmark.ogTitle,
					bookmark.ogDescription
				].filter((part): part is string => typeof part === 'string' && part.trim().length > 0)

				if (textParts.length === 0) {
					this.logger.info(
						'Bookmark has no textual content to analyze. AI auto-collections generation skipped.',
						{ bookmarkId }
					)
					return { success: true, message: 'No textual content to analyze' }
				}

				const textToAnalyze = textParts.join(' ')
				const similarCollectionIds = await this.collectionService.findSimilarCollectionForText(
					userId,
					textToAnalyze,
					0.7
				)

				if (similarCollectionIds.length > 0) {
					const bestCollectionId = similarCollectionIds[0]

					if (bestCollectionId) {
						await this.bookmarkRepository.update(bookmarkId, { collectionId: bestCollectionId })
						await this.collectionRepository.updateBookmarkCount(bestCollectionId, 1)

						this.logger.info('AI auto-collection assigned successfully', {
							bookmarkId,
							collectionId: bestCollectionId
						})
					}
				} else {
					this.logger.info('No similar collections found for AI auto-collection', { bookmarkId })
				}

				return {
					success: true,
					collectionAssigned: similarCollectionIds.length > 0 ? similarCollectionIds[0] : null
				}
			} catch (error) {
				this.logger.error('Error during AI auto-collections generation', {
					bookmarkId,
					userId,
					error: error instanceof Error ? error.message : String(error)
				})
				throw error
			}
		})
	}

	/**
	 * Crea un nuevo marcador para el usuario y la URL proporcionados.
	 * Extrae metadatos de la URL y los asocia con un sitio web.
	 *
	 * @param user - El usuario que crea el marcador.
	 * @param data - Los datos requeridos para crear el marcador.
	 * @returns El marcador creado.
	 */
	async create(user: AccessTokenPayload, data: CreateBookmarkRequestBody) {
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

	/**
	 * Busca un sitio web existente por su dominio o crea uno nuevo.
	 *
	 * @param url - La URL del sitio web.
	 * @param faviconUrl - La URL del favicon del sitio web, si está disponible.
	 * @returns El sitio web encontrado o recién creado.
	 */
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

	/**
	 * Normaliza una URL comparándola con su versión canónica.
	 *
	 * @param originalUrl - La URL original proporcionada.
	 * @param canonicalUrl - La URL canónica, si está disponible.
	 * @returns La URL normalizada, que es la URL canónica o la URL original.
	 */
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

	/**
	 * Obtiene todos los marcadores para el usuario dado.
	 *
	 * @param user - El usuario cuyos marcadores se van a recuperar.
	 * @returns Una lista de marcadores que pertenecen al usuario.
	 */
	async get(user: AccessTokenPayload, options: PaginationOptions, filters?: BookmarkFilters) {
		this.logger.info('Fetching bookmarks', { userId: user.sub, options, filters })
		const bookmarks = await this.bookmarkRepository.findByUserId(user.sub, options, filters)
		this.logger.info('Bookmarks fetched successfully', {
			count: bookmarks.data.length,
			total: bookmarks.meta.total
		})
		return bookmarks
	}

	/**
	 * Elimina un marcador para el usuario dado por su ID.
	 *
	 * @param user - El usuario que solicita la eliminación.
	 * @param bookmarkId - El ID del marcador a eliminar.
	 * @returns El marcador eliminado.
	 */
	async delete(user: AccessTokenPayload, bookmarkId: string) {
		this.logger.info('Deleting bookmark', { bookmarkId, userId: user.sub })
		const bookmark = await this.bookmarkRepository.findById(bookmarkId)

		if (!bookmark || bookmark.userId !== user.sub) {
			this.logger.warn('Bookmark not found for deletion', { bookmarkId, userId: user.sub })
			throw new BookmarkNotFoundError()
		}

		const unitOfWork = container.resolve<IUnitOfWork>(UNIT_OF_WORK)
		await unitOfWork.begin()
		try {
			const deletedBookmark = await this.bookmarkRepository.softDelete(bookmarkId)

			if (bookmark.collectionId) {
				await this.collectionRepository.updateBookmarkCount(bookmark.collectionId, -1, unitOfWork)
			}

			await unitOfWork.commit()
			this.logger.info('Bookmark deleted successfully', { bookmarkId })
			return deletedBookmark
		} catch (error) {
			await unitOfWork.rollback()
			this.logger.error('Error deleting bookmark', { error })
			throw error
		}
	}

	/**
	 * Marca un marcador como favorito para el usuario dado.
	 *
	 * @param user - El usuario que marca el marcador como favorito.
	 * @param bookmarkId - El ID del marcador a marcar como favorito.
	 * @returns El marcador actualizado con el estado de favorito.
	 */
	async markAsFavorite(user: AccessTokenPayload, bookmarkId: string) {
		this.logger.info('Marking bookmark as favorite', { bookmarkId, userId: user.sub })
		const existsBookmark = await this.bookmarkRepository.existsByIdAndUserId(bookmarkId, user.sub)

		if (!existsBookmark) {
			this.logger.warn('Bookmark not found to mark as favorite', { bookmarkId, userId: user.sub })
			throw new BookmarkNotFoundError()
		}

		const result = await this.bookmarkRepository.updateFavoriteStatus(bookmarkId, true)
		this.logger.info('Bookmark marked as favorite successfully', { bookmarkId })
		return result
	}

	/**
	 * Quita el estado de favorito de un marcador para el usuario dado.
	 *
	 * @param user - El usuario que quita el marcador como favorito.
	 * @param bookmarkId - El ID del marcador de la cual se quita el estado de favorito.
	 * @returns El marcador actualizado con el estado de favorito quitado.
	 */
	async unmarkAsFavorite(user: AccessTokenPayload, bookmarkId: string) {
		this.logger.info('Unmarking bookmark as favorite', { bookmarkId, userId: user.sub })
		const existsBookmark = await this.bookmarkRepository.existsByIdAndUserId(bookmarkId, user.sub)

		if (!existsBookmark) {
			this.logger.warn('Bookmark not found to unmark as favorite', { bookmarkId, userId: user.sub })
			throw new BookmarkNotFoundError()
		}

		const result = await this.bookmarkRepository.updateFavoriteStatus(bookmarkId, false)
		this.logger.info('Bookmark unmarked as favorite successfully', { bookmarkId })
		return result
	}

	/**
	 * Actualiza un marcador para el usuario dado.
	 *
	 * @param user - El usuario que actualiza el marcador.
	 * @param bookmarkId - El ID del marcador a actualizar.
	 * @param data - Los datos a actualizar.
	 */
	async update(user: AccessTokenPayload, bookmarkId: string, data: UpdateBookmarkRequestBody) {
		this.logger.info('Updating bookmark', {
			bookmarkId,
			userId: user.sub,
			updateFields: Object.keys(data)
		})
		const bookmark = await this.bookmarkRepository.findById(bookmarkId)
		if (!bookmark || bookmark.userId !== user.sub) {
			this.logger.warn('Bookmark not found for update', { bookmarkId, userId: user.sub })
			throw new BookmarkNotFoundError()
		}

		if (data.tags) {
			await this.tagService.checkTagsOwnership(user.sub, data.tags)
		}

		const updateData: UpdateBookmarkDto = {}
		if (data.title !== undefined) updateData.title = data.title
		if (data.collectionId !== undefined) updateData.collectionId = data.collectionId
		if (data.tags !== undefined) updateData.tags = data.tags

		const unitOfWork = container.resolve<IUnitOfWork>(UNIT_OF_WORK)
		await unitOfWork.begin()
		try {
			await this.bookmarkRepository.update(bookmarkId, updateData, unitOfWork)

			if (data.collectionId !== undefined && data.collectionId !== bookmark.collectionId) {
				// Decrement old collection
				if (bookmark.collectionId) {
					await this.collectionRepository.updateBookmarkCount(bookmark.collectionId, -1, unitOfWork)
				}
				// Increment new collection
				if (data.collectionId) {
					await this.collectionRepository.updateBookmarkCount(data.collectionId, 1, unitOfWork)
				}
			}

			await unitOfWork.commit()
			this.logger.info('Bookmark updated successfully', { bookmarkId })
		} catch (error) {
			await unitOfWork.rollback()
			this.logger.error('Error updating bookmark', { error })
			throw error
		}
	}

	async registerAccess(user: AccessTokenPayload, bookmarkId: string) {
		this.logger.info('Registering access for bookmark', { bookmarkId, userId: user.sub })
		const existsBookmark = await this.bookmarkRepository.existsByIdAndUserId(bookmarkId, user.sub)
		if (!existsBookmark) {
			this.logger.warn('Bookmark not found to register access', { bookmarkId, userId: user.sub })
			throw new BookmarkNotFoundError()
		}

		await this.bookmarkRepository.registerAccess(bookmarkId)
		this.logger.info('Access registered successfully', { bookmarkId })
	}

	/**
	 * Actualiza la colección asociada a un marcador.
	 *
	 * @param user - El usuario que actualiza la colección.
	 * @param bookmarkId - El ID del marcador.
	 * @param collectionId - El ID de la colección a asociar.
	 */
	async updateCollection(user: AccessTokenPayload, bookmarkId: string, collectionId: string) {
		this.logger.info('Updating bookmark collection', { bookmarkId, collectionId, userId: user.sub })
		const bookmark = await this.bookmarkRepository.findById(bookmarkId)
		if (!bookmark || bookmark.userId !== user.sub) {
			this.logger.warn('Bookmark not found for collection update', { bookmarkId, userId: user.sub })
			throw new BookmarkNotFoundError()
		}

		if (bookmark.collectionId === collectionId) return

		const unitOfWork = container.resolve<IUnitOfWork>(UNIT_OF_WORK)
		await unitOfWork.begin()
		try {
			await this.bookmarkRepository.update(bookmarkId, { collectionId }, unitOfWork)

			if (bookmark.collectionId) {
				await this.collectionRepository.updateBookmarkCount(bookmark.collectionId, -1, unitOfWork)
			}

			await this.collectionRepository.updateBookmarkCount(collectionId, 1, unitOfWork)

			await unitOfWork.commit()
			this.logger.info('Bookmark collection updated successfully', { bookmarkId, collectionId })
		} catch (error) {
			await unitOfWork.rollback()
			this.logger.error('Error updating bookmark collection', { error })
			throw error
		}
	}

	/**
	 * Elimina la asociación de colección de un marcador.
	 *
	 * @param user - El usuario que elimina la colección.
	 * @param bookmarkId - El ID del marcador.
	 */
	async removeCollection(user: AccessTokenPayload, bookmarkId: string) {
		this.logger.info('Removing bookmark collection', { bookmarkId, userId: user.sub })
		const bookmark = await this.bookmarkRepository.findById(bookmarkId)
		if (!bookmark || bookmark.userId !== user.sub) {
			this.logger.warn('Bookmark not found for collection removal', {
				bookmarkId,
				userId: user.sub
			})
			throw new BookmarkNotFoundError()
		}

		if (!bookmark.collectionId) return

		const unitOfWork = container.resolve<IUnitOfWork>(UNIT_OF_WORK)
		await unitOfWork.begin()
		try {
			await this.bookmarkRepository.update(bookmarkId, { collectionId: null }, unitOfWork)

			await this.collectionRepository.updateBookmarkCount(bookmark.collectionId, -1, unitOfWork)

			await unitOfWork.commit()
			this.logger.info('Bookmark collection removed successfully', { bookmarkId })
		} catch (error) {
			await unitOfWork.rollback()
			this.logger.error('Error removing bookmark collection', { error })
			throw error
		}
	}
}
