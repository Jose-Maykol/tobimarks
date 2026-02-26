import { inject, injectable } from 'tsyringe'

import { COLLECTION_REPOSITORY } from '../di/token'
import {
	CollectionAlreadyExistsError,
	CollectionNotFoundError
} from '../exceptions/collection.exceptions'
import type { CreateCollectionDto, Collection } from '../models/collection.model'
import type { ICollectionRepository } from '../repositories/collection.repository'
import type {
	CreateCollectionRequestBody,
	UpdateCollectionRequestBody
} from '../types/collection.types'

import type { PaginationOptions, PaginatedResult } from '@/common/types/pagination.type'
import { UniqueConstraintViolationError } from '@/core/database/database.exceptions'
import { LOGGER } from '@/core/di/tokens'
import type { ILogger } from '@/core/logger/logger'
import type { AccessTokenPayload } from '@/modules/auth/types/auth.types'

@injectable()
export class CollectionService {
	private readonly logger: ILogger

	constructor(
		@inject(COLLECTION_REPOSITORY) private readonly collectionRepository: ICollectionRepository,
		@inject(LOGGER) logger: ILogger
	) {
		this.logger = logger.child({ context: 'CollectionService' })
	}

	async create(user: AccessTokenPayload, data: CreateCollectionRequestBody): Promise<Collection> {
		this.logger.info('Creating new collection', { userId: user.sub, name: data.name })
		const newCollection: CreateCollectionDto = {
			userId: user.sub,
			name: data.name,
			description: data.description ?? null,
			color: data.color ?? null,
			icon: data.icon ?? 'folder'
		}

		try {
			const result = await this.collectionRepository.create(newCollection)
			this.logger.info('Collection created successfully', { collectionId: result.id })
			return result
		} catch (error) {
			if (error instanceof UniqueConstraintViolationError) {
				this.logger.warn('Collection already exists', { userId: user.sub, name: data.name })
				throw new CollectionAlreadyExistsError()
			}
			this.logger.error('Error creating collection', { error })
			throw error
		}
	}

	async get(
		user: AccessTokenPayload,
		options: PaginationOptions
	): Promise<PaginatedResult<Collection>> {
		this.logger.info('Fetching collections', { userId: user.sub, options })
		const result = await this.collectionRepository.findByUserId(user.sub, options)
		this.logger.info('Collections fetched', { count: result.data.length, total: result.meta.total })
		return result
	}

	async getById(user: AccessTokenPayload, id: string): Promise<Collection> {
		this.logger.info('Fetching collection by ID', { collectionId: id, userId: user.sub })
		const collection = await this.collectionRepository.findByIdAndUserId(id, user.sub)
		if (!collection) {
			this.logger.warn('Collection not found', { collectionId: id, userId: user.sub })
			throw new CollectionNotFoundError()
		}
		this.logger.info('Collection fetched successfully', { collectionId: id })
		return collection
	}

	async update(
		user: AccessTokenPayload,
		collectionId: string,
		data: UpdateCollectionRequestBody
	): Promise<Collection> {
		this.logger.info('Updating collection', {
			collectionId,
			userId: user.sub,
			updateFields: Object.keys(data)
		})
		const existsCollection = await this.collectionRepository.findByIdAndUserId(
			collectionId,
			user.sub
		)
		if (!existsCollection) {
			this.logger.warn('Collection not found for update', { collectionId, userId: user.sub })
			throw new CollectionNotFoundError()
		}

		const updateData: UpdateCollectionDto = {}
		if (data.name !== undefined) updateData.name = data.name
		if (data.description !== undefined) updateData.description = data.description
		if (data.color !== undefined) updateData.color = data.color
		if (data.icon !== undefined) updateData.icon = data.icon

		try {
			const result = await this.collectionRepository.update(collectionId, updateData)
			this.logger.info('Collection updated successfully', { collectionId })
			return result
		} catch (error) {
			if (error instanceof UniqueConstraintViolationError) {
				this.logger.warn('Collection name already exists during update', {
					collectionId,
					name: data.name
				})
				throw new CollectionAlreadyExistsError()
			}
			this.logger.error('Error updating collection', { error })
			throw error
		}
	}
}
