import slugify from 'slugify'
import { inject, injectable } from 'tsyringe'

import { TAG_REPOSITORY } from '../di/token'
import { TagAlreadyExistsError } from '../exceptions/tag.exceptions'
import type { ITagRepository } from '../repositories/tag.repository'
import type { CreateTagRequestBody } from '../types/tags.types'

import { UniqueConstraintViolationError } from '@/core/database/database.exceptions'
import { EMBEDDING_SERVICE, LOGGER } from '@/core/di/tokens'
import type { IEmbeddingService } from '@/core/embedding/embedding.service'
import type { ILogger } from '@/core/logger/logger'
import type { AccessTokenPayload } from '@/modules/auth/types/auth.types'

/**
 * Caso de uso para crear una nueva etiqueta.
 */
@injectable()
export class CreateTagUseCase {
	private readonly logger: ILogger

	constructor(
		@inject(TAG_REPOSITORY) private readonly tagRepository: ITagRepository,
		@inject(EMBEDDING_SERVICE) private readonly embeddingService: IEmbeddingService,
		@inject(LOGGER) logger: ILogger
	) {
		this.logger = logger.child({ context: 'CreateTagUseCase' })
	}

	async execute(user: AccessTokenPayload, data: CreateTagRequestBody) {
		this.logger.info('Creating new tag', { userId: user.sub, name: data.name })
		const slugName = slugify(data.name, { lower: true, strict: true })
		const embeddingText = data.description ? `${data.name} ${data.description}` : data.name
		const embedding = await this.embeddingService.generateEmbedding(embeddingText)

		const newTag = {
			...data,
			description: data.description ?? null,
			slug: slugName,
			userId: user.sub,
			embedding
		}

		try {
			const createdTag = await this.tagRepository.create(newTag)
			this.logger.info('Tag created successfully', { tagId: createdTag.id })
			return createdTag
		} catch (error) {
			if (error instanceof UniqueConstraintViolationError) {
				this.logger.warn('Tag already exists', { userId: user.sub, name: data.name })
				throw new TagAlreadyExistsError()
			}
			this.logger.error('Error creating tag', { error })
			throw error
		}
	}
}
