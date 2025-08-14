import { registerCoreDependencies } from './core/di/container'
import { registerAuthDependencies } from './modules/auth/di/container'
import { registerUserDependencies } from './modules/user/di/container'

export const configureContainer = () => {
	registerCoreDependencies()
	registerUserDependencies()
	registerAuthDependencies()
}
