import { container } from 'tsyringe'

import { USER_REPOSITORY, USER_SERVICE } from './tokens'
import { UserRepository } from '../repositories/user.repository'
import { UserService } from '../services/user.service'

export const registerUserDependencies = () => {
	container.register(USER_SERVICE, { useClass: UserService })
	container.register(USER_REPOSITORY, { useClass: UserRepository })
}
