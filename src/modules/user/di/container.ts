import { container } from 'tsyringe'

import { USER_CONTROLLER, USER_REPOSITORY, USER_SERVICE } from './tokens'
import { UserController } from '../controllers/user.controller'
import { UserRepository } from '../repositories/user.repository'
import { UserService } from '../services/user.service'

export const registerUserDependencies = () => {
	container.register(USER_CONTROLLER, { useClass: UserController })
	container.register(USER_SERVICE, { useClass: UserService })
	container.register(USER_REPOSITORY, { useClass: UserRepository })
}
