import { inject, injectable } from 'tsyringe'

import { TAG_REPOSITORY } from '../di/token'
import { TagNotFoundError } from '../exceptions/tag.exceptions'
import type { ITagRepository } from '../repositories/tag.repository'

import { LOGGER } from '@/core/di/tokens'
import type { ILogger } from '@/core/logger/logger'

/**
 * Caso de uso para verificar que todos los IDs de etiquetas proporcionados pertenezcan al usuario especificado.
 */
@injectable()
export class CheckTagsOwnershipUseCase {
	private readonly logger: ILogger

	constructor(
		@inject(TAG_REPOSITORY) private readonly tagRepository: ITagRepository,
		@inject(LOGGER) logger: ILogger
	) {
		this.logger = logger.child({ context: 'CheckTagsOwnershipUseCase' })
	}

	async execute(userId: string, tagIds: string[]) {
		if (tagIds.length === 0) return true
		this.logger.info('Checking tags ownership', { userId, count: tagIds.length })

		const allTagsExist = await this.tagRepository.existsByUserIdAndIds(userId, tagIds)

		if (!allTagsExist) {
			this.logger.warn('Tag ownership check failed', { userId, tagIds })
			throw new TagNotFoundError()
		}

		return true
	}
}
