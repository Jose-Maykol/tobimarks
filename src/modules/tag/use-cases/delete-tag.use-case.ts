import { inject, injectable } from 'tsyringe'

import { TAG_REPOSITORY } from '../di/token'
import { TagNotFoundError } from '../exceptions/tag.exceptions'
import type { ITagRepository } from '../repositories/tag.repository'

import { LOGGER } from '@/core/di/tokens'
import type { ILogger } from '@/core/logger/logger'
import type { AccessTokenPayload } from '@/modules/auth/types/auth.types'

/**
 * Caso de uso para eliminar una etiqueta existente.
 */
@injectable()
export class DeleteTagUseCase {
	private readonly logger: ILogger

	constructor(
		@inject(TAG_REPOSITORY) private readonly tagRepository: ITagRepository,
		@inject(LOGGER) logger: ILogger
	) {
		this.logger = logger.child({ context: 'DeleteTagUseCase' })
	}

	async execute(user: AccessTokenPayload, id: string): Promise<void> {
		this.logger.info('Deleting tag', { tagId: id, userId: user.sub })
		const tagExists = await this.tagRepository.existsByIdAndUserId(id, user.sub)
		if (!tagExists) {
			this.logger.warn('Tag not found for deletion', { tagId: id, userId: user.sub })
			throw new TagNotFoundError()
		}
		await this.tagRepository.delete(id)
		this.logger.info('Tag deleted successfully', { tagId: id })
	}
}
