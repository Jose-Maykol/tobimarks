import slugify from 'slugify'
import { inject, injectable } from 'tsyringe'

import { TAG_REPOSITORY } from '../di/token'
import { TagAlreadyExistsError, TagNotFoundError } from '../exceptions/tag.exceptions'
import type { ITagRepository } from '../repositories/tag.repository'
import type { CreateTagRequestBody, UpdateTagRequestBody } from '../types/tags.types'

import { UniqueConstraintViolationError } from '@/core/database/database.exceptions'
import { EMBEDDING_SERVICE } from '@/core/di/tokens'
import type { IEmbeddingService } from '@/core/embedding/embedding.service'
import type { AccessTokenPayload } from '@/modules/auth/types/auth.types'

@injectable()
export class TagService {
	constructor(
		@inject(TAG_REPOSITORY) private readonly tagRepository: ITagRepository,
		@inject(EMBEDDING_SERVICE) private readonly embeddingService: IEmbeddingService
	) {}

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
	 * Generates an embedding for the tag name using the embedding service.
	 *
	 * @param user - The authenticated user's information (token payload).
	 * @param data - The data required to create the tag, including its name.
	 * @returns A promise that resolves to the created tag.
	 * @throws TagAlreadyExistsError - If a tag with the same name already exists.
	 */
	async create(user: AccessTokenPayload, data: CreateTagRequestBody) {
		const slugName = slugify(data.name, { lower: true, strict: true })
		const embedding = await this.embeddingService.generateEmbedding(data.name)

		const newTag = {
			...data,
			slug: slugName,
			userId: user.sub,
			embedding
		}

		try {
			const createdTag = await this.tagRepository.create(newTag)
			return createdTag
		} catch (error) {
			if (error instanceof UniqueConstraintViolationError) {
				throw new TagAlreadyExistsError()
			}
			throw error
		}
	}

	/**
	 * Updates an existing tag for the authenticated user.
	 * Ensures the tag belongs to the user before updating.
	 * Generates a new slug and embedding from the updated tag name.
	 *
	 * @param user - The authenticated user's information (token payload).
	 * @param tagId - The unique identifier of the tag to update.
	 * @param data - The data to update the tag, including its name.
	 * @returns A promise that resolves to the updated tag.
	 * @throws TagNotFoundError - If the tag does not exist or does not belong to the user.
	 */
	async update(user: AccessTokenPayload, tagId: string, data: UpdateTagRequestBody) {
		const tagExists = await this.tagRepository.existsByIdAndUserId(tagId, user.sub)
		if (!tagExists) throw new TagNotFoundError()

		const slugName = slugify(data.name)
		const embedding = await this.embeddingService.generateEmbedding(data.name)

		const updateData = {
			...data,
			slug: slugName,
			embedding
		}

		const updatedTag = await this.tagRepository.update(tagId, updateData)
		return updatedTag!
	}

	/**
	 * Deletes an existing tag for the authenticated user.
	 * Ensures the tag belongs to the user before deletion.
	 *
	 * @param user - The authenticated user's information (token payload).
	 * @param id - The unique identifier of the tag to delete.
	 * @returns A promise that resolves when the tag is deleted.
	 * @throws TagNotFoundError - If the tag does not exist or does not belong to the user.
	 */
	async delete(user: AccessTokenPayload, id: string): Promise<void> {
		const tagExists = await this.tagRepository.existsByIdAndUserId(id, user.sub)
		if (!tagExists) throw new TagNotFoundError()
		await this.tagRepository.delete(id)
	}
}
