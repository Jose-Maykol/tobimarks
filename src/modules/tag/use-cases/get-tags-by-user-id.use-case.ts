import { inject, injectable } from 'tsyringe'

import { TAG_REPOSITORY } from '../di/token'
import type { ITagRepository } from '../repositories/tag.repository'

import { LOGGER } from '@/core/di/tokens'
import type { ILogger } from '@/core/logger/logger'

/**
 * Caso de uso para obtener todas las etiquetas creadas por un usuario específico.
 */
@injectable()
export class GetTagsByUserIdUseCase {
	private readonly logger: ILogger

	constructor(
		@inject(TAG_REPOSITORY) private readonly tagRepository: ITagRepository,
		@inject(LOGGER) logger: ILogger
	) {
		this.logger = logger.child({ context: 'GetTagsByUserIdUseCase' })
	}

	async execute(userId: string) {
		this.logger.info('Fetching tags by user', { userId })
		const tags = await this.tagRepository.findByUserId(userId)
		this.logger.info('Tags fetched successfully', { userId, count: tags.length })
		return tags
	}
}
