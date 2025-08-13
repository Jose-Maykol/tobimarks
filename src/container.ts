import { registerAuthDependencies } from './auth/di/container'
import { registerCoreDependencies } from './core/di/container'
import { registerUserDependencies } from './user/di/container'

export const configureContainer = () => {
	registerCoreDependencies()
	registerUserDependencies()
	registerAuthDependencies()
}
