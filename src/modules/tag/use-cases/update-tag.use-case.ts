import slugify from 'slugify'
import { inject, injectable } from 'tsyringe'

import { TAG_REPOSITORY } from '../di/token'
import { TagNotFoundError } from '../exceptions/tag.exceptions'
import type { ITagRepository } from '../repositories/tag.repository'
import type { UpdateTagRequestBody } from '../types/tags.types'

import { EMBEDDING_SERVICE, LOGGER } from '@/core/di/tokens'
import type { IEmbeddingService } from '@/core/embedding/embedding.service'
import type { ILogger } from '@/core/logger/logger'
import type { AccessTokenPayload } from '@/modules/auth/types/auth.types'

/**
 * Caso de uso para actualizar una etiqueta existente.
 */
@injectable()
export class UpdateTagUseCase {
	private readonly logger: ILogger

	constructor(
		@inject(TAG_REPOSITORY) private readonly tagRepository: ITagRepository,
		@inject(EMBEDDING_SERVICE) private readonly embeddingService: IEmbeddingService,
		@inject(LOGGER) logger: ILogger
	) {
		this.logger = logger.child({ context: 'UpdateTagUseCase' })
	}

	async execute(user: AccessTokenPayload, tagId: string, data: UpdateTagRequestBody) {
		this.logger.info('Updating tag', { tagId, userId: user.sub, name: data.name })
		const tagExists = await this.tagRepository.existsByIdAndUserId(tagId, user.sub)
		if (!tagExists) {
			this.logger.warn('Tag not found for update', { tagId, userId: user.sub })
			throw new TagNotFoundError()
		}

		const slugName = slugify(data.name)
		const embeddingText = data.description
			? `Tag: ${data.name}. Description: ${data.description}`
			: `Tag: ${data.name}`
		const embedding = await this.embeddingService.generateEmbedding(embeddingText)

		const updateData = {
			...data,
			description: data.description ?? null,
			slug: slugName,
			embedding
		}

		const updatedTag = await this.tagRepository.update(tagId, updateData)
		this.logger.info('Tag updated successfully', { tagId })
		return updatedTag!
	}
}
