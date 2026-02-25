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
import type { AccessTokenPayload } from '@/modules/auth/types/auth.types'

@injectable()
export class CollectionService {
	constructor(
		@inject(COLLECTION_REPOSITORY) private readonly collectionRepository: ICollectionRepository
	) {}

	async create(user: AccessTokenPayload, data: CreateCollectionRequestBody): Promise<Collection> {
		const newCollection: CreateCollectionDto = {
			userId: user.sub,
			name: data.name,
			description: data.description ?? null
		}

		try {
			return await this.collectionRepository.create(newCollection)
		} catch (error) {
			if (error instanceof UniqueConstraintViolationError) {
				throw new CollectionAlreadyExistsError()
			}
			throw error
		}
	}

	async get(
		user: AccessTokenPayload,
		options: PaginationOptions
	): Promise<PaginatedResult<Collection>> {
		return await this.collectionRepository.findByUserId(user.sub, options)
	}

	async getById(user: AccessTokenPayload, id: string): Promise<Collection> {
		const collection = await this.collectionRepository.findByIdAndUserId(id, user.sub)
		if (!collection) throw new CollectionNotFoundError()
		return collection
	}

	async update(
		user: AccessTokenPayload,
		collectionId: string,
		data: UpdateCollectionRequestBody
	): Promise<Collection> {
		const existsCollection = await this.collectionRepository.findByIdAndUserId(
			collectionId,
			user.sub
		)
		if (!existsCollection) throw new CollectionNotFoundError()

		const updateData: Partial<Pick<Collection, 'name' | 'description'>> = {}
		if (data.name !== undefined) updateData.name = data.name
		if (data.description !== undefined) updateData.description = data.description

		try {
			return await this.collectionRepository.update(collectionId, updateData)
		} catch (error) {
			if (error instanceof UniqueConstraintViolationError) {
				throw new CollectionAlreadyExistsError()
			}
			throw error
		}
	}
}
