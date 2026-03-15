import slugify from 'slugify'
import { inject, injectable } from 'tsyringe'

import { TAG_REPOSITORY } from '../di/token'
import { TagAlreadyExistsError, TagNotFoundError } from '../exceptions/tag.exceptions'
import type { ITagRepository } from '../repositories/tag.repository'
import type { CreateTagRequestBody, UpdateTagRequestBody } from '../types/tags.types'

import { UniqueConstraintViolationError } from '@/core/database/database.exceptions'
import { EMBEDDING_SERVICE, LOGGER } from '@/core/di/tokens'
import type { IEmbeddingService } from '@/core/embedding/embedding.service'
import type { ILogger } from '@/core/logger/logger'
import type { AccessTokenPayload } from '@/modules/auth/types/auth.types'

@injectable()
export class TagService {
	private readonly logger: ILogger

	constructor(
		@inject(TAG_REPOSITORY) private readonly tagRepository: ITagRepository,
		@inject(EMBEDDING_SERVICE) private readonly embeddingService: IEmbeddingService,
		@inject(LOGGER) logger: ILogger
	) {
		this.logger = logger.child({ context: 'TagService' })
	}

	/**
	 * Retrieves all tags created by a specific user.
	 *
	 * @param userId - The unique identifier of the user.
	 * @returns A promise that resolves to the list of tags belonging to the user.
	 */
	async getByUserId(userId: string) {
		this.logger.info('Fetching tags by user', { userId })
		const tags = await this.tagRepository.findByUserId(userId)
		this.logger.info('Tags fetched successfully', { userId, count: tags.length })
		return tags
	}

	/**
	 * Verifies that all provided tag IDs belong to the specified user.
	 * Throws an error if any tag does not belong to the user.
	 *
	 * @param userId - The unique identifier of the user.
	 * @param tagIds - The list of tag IDs to verify ownership.
	 * @returns A promise that resolves to true if all tags belong to the user.
	 * @throws TagNotFoundError - If any tag does not belong to the user.
	 */
	async checkTagsOwnership(userId: string, tagIds: string[]) {
		if (tagIds.length === 0) return true
		this.logger.info('Checking tags ownership', { userId, count: tagIds.length })

		const allTagsExist = await this.tagRepository.existsByUserIdAndIds(userId, tagIds)

		if (!allTagsExist) {
			this.logger.warn('Tag ownership check failed', { userId, tagIds })
			throw new TagNotFoundError()
		}
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
		this.logger.info('Creating new tag', { userId: user.sub, name: data.name })
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
		this.logger.info('Updating tag', { tagId, userId: user.sub, name: data.name })
		const tagExists = await this.tagRepository.existsByIdAndUserId(tagId, user.sub)
		if (!tagExists) {
			this.logger.warn('Tag not found for update', { tagId, userId: user.sub })
			throw new TagNotFoundError()
		}

		const slugName = slugify(data.name)
		const embedding = await this.embeddingService.generateEmbedding(data.name)

		const updateData = {
			...data,
			slug: slugName,
			embedding
		}

		const updatedTag = await this.tagRepository.update(tagId, updateData)
		this.logger.info('Tag updated successfully', { tagId })
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
		this.logger.info('Deleting tag', { tagId: id, userId: user.sub })
		const tagExists = await this.tagRepository.existsByIdAndUserId(id, user.sub)
		if (!tagExists) {
			this.logger.warn('Tag not found for deletion', { tagId: id, userId: user.sub })
			throw new TagNotFoundError()
		}
		await this.tagRepository.delete(id)
		this.logger.info('Tag deleted successfully', { tagId: id })
	}

	/**
	 * Finds tags that are similar to a given text using vector embeddings.
	 *
	 * @param userId - The user ID whose tags will be searched.
	 * @param text - The text to compare against the tags.
	 * @param threshold - The similarity threshold (0 to 1). Higher means more similar. Default 0.7.
	 * @returns A promise that resolves to an array of tag IDs.
	 */
	async findSimilarTagsForText(
		userId: string,
		text: string,
		threshold: number = 0.7
	): Promise<string[]> {
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
