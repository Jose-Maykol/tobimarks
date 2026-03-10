import { inject, injectable } from 'tsyringe'

import { USER_REPOSITORY } from '../di/tokens'
import { UserNotFoundError } from '../exceptions/user.exceptions'
import type { CreateUserDto, ProfileUserDto, User, UserSettings } from '../models/user.model'
import type { IUserRepository } from '../repositories/user.repository'
import type { UpdateUserSettingsRequestBody } from '../types/user.types'

import { LOGGER } from '@/core/di/tokens'
import type { ILogger } from '@/core/logger/logger'

@injectable()
export class UserService {
	private readonly logger: ILogger

	constructor(
		@inject(USER_REPOSITORY) private readonly userRepository: IUserRepository,
		@inject(LOGGER) logger: ILogger
	) {
		this.logger = logger.child({ context: 'UserService' })
	}

	async findByGoogleId(googleId: string): Promise<User | null> {
		this.logger.info('Fetching user by Google ID', { googleId })
		const user = await this.userRepository.findByGoogleId(googleId)
		if (user) {
			this.logger.info('User found', { userId: user.id })
		} else {
			this.logger.info('User not found')
			throw new UserNotFoundError()
		}
		return user
	}

	async getProfile(userId: string): Promise<ProfileUserDto | null> {
		this.logger.info('Fetching profile for user', { userId })
		if (!userId) {
			this.logger.warn('Profile fetch failed: userId is missing')
			throw new UserNotFoundError()
		}
		const profile = await this.userRepository.findById(userId)
		this.logger.info('Profile fetched successfully', { userId })
		return profile
	}

	async create(params: CreateUserDto): Promise<User> {
		this.logger.info('Creating new user', { email: params.email })
		const user = await this.userRepository.create(params)
		this.logger.info('User created successfully', { userId: user.id })
		return user
	}

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
		this.logger.info('User settings updated successfully', { userId })
		return profile
	}
}
