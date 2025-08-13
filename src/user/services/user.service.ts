import { inject, injectable } from 'tsyringe'

import { USER_REPOSITORY } from '../di/tokens'
import type { CreateUserDto, User } from '../models/user.model'
import type { IUserRepository } from '../repositories/user.repository'

@injectable()
export class UserService {
	constructor(@inject(USER_REPOSITORY) private readonly userRepository: IUserRepository) {}

	async findByGoogleId(googleId: string): Promise<User | null> {
		return this.userRepository.findByGoogleId(googleId)
	}

	async create(params: CreateUserDto): Promise<User> {
		return this.userRepository.create(params)
	}
}
