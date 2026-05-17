import { inject, injectable } from 'tsyringe'

import { TAG_REPOSITORY } from '../di/token'
import type { ITagRepository } from '../repositories/tag.repository'

import { EMBEDDING_SERVICE, LOGGER } from '@/core/di/tokens'
import type { IEmbeddingService } from '@/core/embedding/embedding.service'
import type { ILogger } from '@/core/logger/logger'

/**
 * Caso de uso para buscar etiquetas que sean similares a un texto dado utilizando embeddings vectoriales.
 */
@injectable()
export class FindSimilarTagsForTextUseCase {
	private readonly logger: ILogger

	constructor(
		@inject(TAG_REPOSITORY) private readonly tagRepository: ITagRepository,
		@inject(EMBEDDING_SERVICE) private readonly embeddingService: IEmbeddingService,
		@inject(LOGGER) logger: ILogger
	) {
		this.logger = logger.child({ context: 'FindSimilarTagsForTextUseCase' })
	}

	async execute(userId: string, text: string, threshold: number = 0.7): Promise<string[]> {
		this.logger.info('Finding similar tags for text', {
			userId,
			textLength: text.length,
			threshold
		})

		const embedding = await this.embeddingService.generateEmbedding(text)
		const tagIds = await this.tagRepository.findSimilar(userId, embedding, threshold)

		this.logger.info('Similar tags search completed', { userId, foundCount: tagIds.length })
		return tagIds
	}
}
