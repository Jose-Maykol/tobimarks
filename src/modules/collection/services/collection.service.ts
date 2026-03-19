import { inject, injectable } from 'tsyringe'

import { COLLECTION_REPOSITORY } from '../di/token'
import {
	CollectionAlreadyExistsError,
	CollectionNotFoundError
} from '../exceptions/collection.exceptions'
import type {
	CreateCollectionDto,
	Collection,
	UpdateCollectionDto
} from '../models/collection.model'
import type { ICollectionRepository } from '../repositories/collection.repository'
import type {
	CreateCollectionRequestBody,
	UpdateCollectionRequestBody
} from '../types/collection.types'

import type { PaginationOptions, PaginatedResult } from '@/common/types/pagination.type'
import { UniqueConstraintViolationError } from '@/core/database/database.exceptions'
import { EMBEDDING_SERVICE, LOGGER } from '@/core/di/tokens'
import type { IEmbeddingService } from '@/core/embedding/embedding.service'
import type { ILogger } from '@/core/logger/logger'
import type { AccessTokenPayload } from '@/modules/auth/types/auth.types'

/**
 * Servicio encargado de la gestión de colecciones de marcadores.
 * Permite crear, recuperar, actualizar y buscar colecciones.
 * Utiliza embeddings vectoriales para permitir búsquedas por similitud.
 */
@injectable()
export class CollectionService {
	private readonly logger: ILogger

	constructor(
		@inject(COLLECTION_REPOSITORY) private readonly collectionRepository: ICollectionRepository,
		@inject(EMBEDDING_SERVICE) private readonly embeddingService: IEmbeddingService,
		@inject(LOGGER) logger: ILogger
	) {
		this.logger = logger.child({ context: 'CollectionService' })
	}

	/**
	 * Crea una nueva colección para el usuario autenticado.
	 * Genera automáticamente un embedding basado en el nombre y la descripción.
	 *
	 * @param user - Información del usuario autenticado (payload del token).
	 * @param data - Los datos requeridos para crear la colección.
	 * @returns La colección creada.
	 * @throws CollectionAlreadyExistsError - Si ya existe una colección con el mismo nombre para el usuario.
	 */
	async create(user: AccessTokenPayload, data: CreateCollectionRequestBody): Promise<Collection> {
		this.logger.info('Creating new collection', { userId: user.sub, name: data.name })
		const textForEmbedding = `${data.name} ${data.description || ''}`.trim()
		const embedding = await this.embeddingService.generateEmbedding(textForEmbedding)

		const newCollection: CreateCollectionDto = {
			userId: user.sub,
			name: data.name,
			description: data.description ?? null,
			color: data.color ?? null,
			icon: data.icon ?? 'folder',
			embedding
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

	/**
	 * Obtiene una lista paginada de colecciones para el usuario autenticado.
	 *
	 * @param user - Información del usuario autenticado (payload del token).
	 * @param options - Opciones de paginación (página, límite).
	 * @returns Un resultado paginado con las colecciones.
	 */
	async get(
		user: AccessTokenPayload,
		options: PaginationOptions
	): Promise<PaginatedResult<Collection>> {
		this.logger.info('Fetching collections', { userId: user.sub, options })
		const result = await this.collectionRepository.findByUserId(user.sub, options)
		this.logger.info('Collections fetched', { count: result.data.length, total: result.meta.total })
		return result
	}

	/**
	 * Obtiene una colección específica por su ID, asegurando que pertenezca al usuario.
	 *
	 * @param user - Información del usuario autenticado (payload del token).
	 * @param id - Identificador único de la colección.
	 * @returns La colección encontrada.
	 * @throws CollectionNotFoundError - Si la colección no existe o no pertenece al usuario.
	 */
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

	/**
	 * Actualiza una colección existente.
	 * Si el nombre o la descripción cambian, se regenera el embedding vectorial.
	 *
	 * @param user - Información del usuario autenticado (payload del token).
	 * @param collectionId - Identificador único de la colección a actualizar.
	 * @param data - Los datos a actualizar.
	 * @returns La colección actualizada.
	 * @throws CollectionNotFoundError - Si la colección no existe o no pertenece al usuario.
	 * @throws CollectionAlreadyExistsError - Si el nuevo nombre ya está en uso por otra colección del usuario.
	 */
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

		let textChanged = false
		let newName = existsCollection.name
		let newDescription = existsCollection.description

		if (data.name !== undefined) {
			updateData.name = data.name
			newName = data.name
			textChanged = true
		}
		if (data.description !== undefined) {
			updateData.description = data.description
			newDescription = data.description
			textChanged = true
		}
		if (data.color !== undefined) updateData.color = data.color
		if (data.icon !== undefined) updateData.icon = data.icon

		if (textChanged) {
			const textForEmbedding = `${newName} ${newDescription || ''}`.trim()
			updateData.embedding = await this.embeddingService.generateEmbedding(textForEmbedding)
		}

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

	/**
	 * Busca colecciones similares a un texto dado utilizando embeddings vectoriales.
	 *
	 * @param userId - El ID del usuario cuyas colecciones se buscarán.
	 * @param text - El texto para comparar con las colecciones.
	 * @param threshold - El umbral de similitud (0 a 1). Por defecto 0.7.
	 * @returns Una promesa que se resuelve con un array de IDs de colecciones.
	 */
	async findSimilarCollectionForText(
		userId: string,
		text: string,
		threshold: number = 0.7
	): Promise<string[]> {
		this.logger.info('Finding similar collections for text', {
			userId,
			textLength: text.length,
			threshold
		})

		const embedding = await this.embeddingService.generateEmbedding(text)
		const collectionIds = await this.collectionRepository.findSimilar(userId, embedding, threshold)

		this.logger.info('Similar collections search completed', {
			userId,
			foundCount: collectionIds.length
		})
		return collectionIds
	}
}
