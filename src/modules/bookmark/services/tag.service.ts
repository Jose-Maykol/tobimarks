import slugify from 'slugify'
import { inject, injectable } from 'tsyringe'

import { TAG_REPOSITORY } from '../di/token'
import type { ITagRepository } from '../repositories/tag.repository'
import type { CreateTagRequestBody } from '../types/tags.types'

import type { AccessTokenPayload } from '@/modules/auth/types/auth.types'

@injectable()
export class TagService {
	/**
	 * Initializes the service with the tag repository.
	 * @param tagRepository - Instance of the tag repository.
	 */
	constructor(@inject(TAG_REPOSITORY) private readonly tagRepository: ITagRepository) {}

	/**
	 * Retrieves all tags created by a specific user.
	 *
	 * @param userId - The unique identifier of the user.
	 * @returns A promise that resolves to the list of tags belonging to the user.
	 */
	async getByUserId(userId: string) {
		const tags = await this.tagRepository.findByUserId(userId)
		return tags
	}

	/**
	 * Creates a new tag for the authenticated user.
	 * Generates a slug from the tag name to ensure uniqueness.
	 *
	 * @param user - The authenticated user's information (token payload).
	 * @param data - The data required to create the tag, including its name.
	 * @returns A promise that resolves to the created tag.
	 */
	async create(user: AccessTokenPayload, data: CreateTagRequestBody) {
		const slugName = slugify(data.name)

		const newTag = {
			...data,
			slug: slugName,
			userId: user.sub
		}

		const createdTag = await this.tagRepository.create(newTag)
		return createdTag
	}
}
