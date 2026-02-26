import { inject, injectable } from 'tsyringe'

import { USER_REPOSITORY } from '../di/tokens'
import { UserNotFoundError } from '../exceptions/user.exceptions'
import type { CreateUserDto, ProfileUserDto, User, UserSettings } from '../models/user.model'
import type { IUserRepository } from '../repositories/user.repository'
import type { UpdateUserSettingsRequestBody } from '../types/user.types'

@injectable()
export class UserService {
	constructor(@inject(USER_REPOSITORY) private readonly userRepository: IUserRepository) {}

	async findByGoogleId(googleId: string): Promise<User | null> {
		return this.userRepository.findByGoogleId(googleId)
	}

	async getProfile(userId: string): Promise<ProfileUserDto | null> {
		if (!userId) throw new UserNotFoundError()
		return this.userRepository.findById(userId)
	}

	async create(params: CreateUserDto): Promise<User> {
		return this.userRepository.create(params)
	}

	async updateSettings(
		userId: string,
		data: UpdateUserSettingsRequestBody
	): Promise<ProfileUserDto> {
		if (!userId) throw new UserNotFoundError()
		return this.userRepository.updateSettings(userId, data as Partial<UserSettings>)
	}
}
