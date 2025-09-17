import { inject, injectable } from 'tsyringe'

import { TAG_REPOSITORY } from '../di/token'
import type { ITagRepository } from '../repositories/tag,repository'

@injectable()
export class TagService {
	constructor(@inject(TAG_REPOSITORY) private readonly tagRepository: ITagRepository) {}

	async getByUserId(userId: string) {
		const tags = await this.tagRepository.findByUserId(userId)
		return tags
	}
}
