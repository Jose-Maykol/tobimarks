import { inject, injectable } from 'tsyringe'

import { USER_REPOSITORY } from '../di/tokens'
import { UserNotFoundError } from '../exceptions/user.exceptions'
import type { CreateUserDto, ProfileUserDto, User, UserSettings } from '../models/user.model'
import type { IUserRepository } from '../repositories/user.repository'
import type { UpdateUserSettingsRequestBody } from '../types/user.types'

import type { ICacheService } from '@/core/cache/cache.service'
import { CACHE_SERVICE, LOGGER } from '@/core/di/tokens'
import type { ILogger } from '@/core/logger/logger'

/**
 * Servicio encargado de la gestión de usuarios y sus perfiles.
 * Proporciona funcionalidad para buscar usuarios por Google ID, obtener perfiles,
 * crear nuevos usuarios y actualizar la configuración del usuario.
 * Utiliza un servicio de caché para optimizar la obtención de perfiles de usuario.
 */
@injectable()
export class UserService {
	private readonly logger: ILogger

	constructor(
		@inject(USER_REPOSITORY) private readonly userRepository: IUserRepository,
		@inject(CACHE_SERVICE) private readonly cacheService: ICacheService,
		@inject(LOGGER) logger: ILogger
	) {
		this.logger = logger.child({ context: 'UserService' })
	}

	/**
	 * Busca un usuario por su identificador único proporcionado por Google.
	 *
	 * @param googleId - Identificador único de Google para el usuario.
	 * @returns Una promesa que se resuelve con el usuario encontrado o null si no existe.
	 */
	async findByGoogleId(googleId: string): Promise<User | null> {
		this.logger.info('Searching for user by Google ID', { googleId })
		const user = await this.userRepository.findByGoogleId(googleId)

		if (user) {
			this.logger.info('User found with Google ID', { userId: user.id })
		} else {
			this.logger.info('User not found for Google ID', { googleId })
		}

		return user
	}

	/**
	 * Obtiene el perfil de un usuario específico.
	 * Intenta recuperar el perfil de la caché antes de consultar la base de datos.
	 *
	 * @param userId - Identificador único del usuario.
	 * @returns Una promesa que se resuelve con el perfil del usuario o null si no se encuentra.
	 * @throws UserNotFoundError - Si el identificador del usuario no se proporciona.
	 */
	async getProfile(userId: string): Promise<ProfileUserDto | null> {
		this.logger.info('Fetching profile for user', { userId })
		if (!userId) {
			this.logger.warn('Profile fetch failed: userId is missing')
			throw new UserNotFoundError()
		}

		const cacheKey = `user:profile:${userId}`

		const cachedProfile = await this.cacheService.get<ProfileUserDto>(cacheKey)
		if (cachedProfile) {
			this.logger.debug('Profile fetched from cache', { userId })
			return cachedProfile
		}

		const profile = await this.userRepository.findById(userId)

		if (profile) {
			await this.cacheService.set(cacheKey, profile, 3600)
			this.logger.info('Profile fetched from DB and cached', { userId })
		}

		return profile
	}

	/**
	 * Crea un nuevo usuario en el sistema.
	 *
	 * @param params - Datos requeridos para crear el nuevo usuario.
	 * @returns Una promesa que se resuelve con el usuario recién creado.
	 */
	async create(params: CreateUserDto): Promise<User> {
		this.logger.info('Creating new user', { email: params.email })
		const user = await this.userRepository.create(params)
		this.logger.info('User created successfully', { userId: user.id })
		return user
	}

	/**
	 * Actualiza la configuración de perfil de un usuario existente e invalida su caché.
	 *
	 * @param userId - Identificador único del usuario.
	 * @param data - Los nuevos datos de configuración del usuario.
	 * @returns Una promesa que se resuelve con el perfil del usuario actualizado.
	 * @throws UserNotFoundError - Si el identificador del usuario no se proporciona.
	 */
	async updateSettings(
		userId: string,
		data: UpdateUserSettingsRequestBody
	): Promise<ProfileUserDto> {
		this.logger.info('Updating user settings', { userId })
		if (!userId) {
			this.logger.warn('Settings update failed: userId is missing')
			throw new UserNotFoundError()
		}
		const profile = await this.userRepository.updateSettings(userId, data as Partial<UserSettings>)

		await this.cacheService.delete(`user:profile:${userId}`)

		this.logger.info('User settings updated and cache invalidated', { userId })
		return profile
	}
}
