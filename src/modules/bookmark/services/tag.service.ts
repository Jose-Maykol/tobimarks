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

/**
 * Servicio encargado de la gestión de etiquetas (tags).
 * Proporciona funcionalidad para crear, actualizar, eliminar y buscar etiquetas,
 * así como para verificar la propiedad de las mismas.
 */
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
	 * Obtiene todas las etiquetas creadas por un usuario específico.
	 *
	 * @param userId - El identificador único del usuario.
	 * @returns Una promesa que se resuelve con la lista de etiquetas del usuario.
	 */
	async getByUserId(userId: string) {
		this.logger.info('Fetching tags by user', { userId })
		const tags = await this.tagRepository.findByUserId(userId)
		this.logger.info('Tags fetched successfully', { userId, count: tags.length })
		return tags
	}

	/**
	 * Verifica que todos los IDs de etiquetas proporcionados pertenezcan al usuario especificado.
	 * Lanza un error si alguna etiqueta no pertenece al usuario.
	 *
	 * @param userId - El identificador único del usuario.
	 * @param tagIds - La lista de IDs de etiquetas para verificar la propiedad.
	 * @returns Una promesa que se resuelve en true si todas las etiquetas pertenecen al usuario.
	 * @throws TagNotFoundError - Si alguna etiqueta no pertenece al usuario.
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
	 * Crea una nueva etiqueta para el usuario autenticado.
	 * Genera un slug a partir del nombre de la etiqueta para asegurar la unicidad.
	 * Genera un embedding para el nombre de la etiqueta utilizando el servicio de embeddings.
	 *
	 * @param user - Información del usuario autenticado (payload del token).
	 * @param data - Los datos requeridos para crear la etiqueta, incluyendo su nombre.
	 * @returns Una promesa que se resuelve con la etiqueta creada.
	 * @throws TagAlreadyExistsError - Si ya existe una etiqueta con el mismo nombre.
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
	 * Actualiza una etiqueta existente para el usuario autenticado.
	 * Asegura que la etiqueta pertenezca al usuario antes de actualizar.
	 * Genera un nuevo slug y embedding a partir del nombre actualizado de la etiqueta.
	 *
	 * @param user - Información del usuario autenticado (payload del token).
	 * @param tagId - El identificador único de la etiqueta a actualizar.
	 * @param data - Los datos para actualizar la etiqueta, incluyendo su nombre.
	 * @returns Una promesa que se resuelve con la etiqueta actualizada.
	 * @throws TagNotFoundError - Si la etiqueta no existe o no pertenece al usuario.
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
	 * Elimina una etiqueta existente para el usuario autenticado.
	 * Asegura que la etiqueta pertenezca al usuario antes de la eliminación.
	 *
	 * @param user - Información del usuario autenticado (payload del token).
	 * @param id - El identificador único de la etiqueta a eliminar.
	 * @returns Una promesa que se resuelve cuando la etiqueta es eliminada.
	 * @throws TagNotFoundError - Si la etiqueta no existe o no pertenece al usuario.
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
	 * Busca etiquetas que sean similares a un texto dado utilizando embeddings vectoriales.
	 *
	 * @param userId - El ID del usuario cuyas etiquetas se buscarán.
	 * @param text - El texto para comparar con las etiquetas.
	 * @param threshold - El umbral de similitud (0 a 1). Mayor significa más similar. Por defecto 0.7.
	 * @returns Una promesa que se resuelve con un array de IDs de etiquetas.
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
