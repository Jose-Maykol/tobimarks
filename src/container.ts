import { registerCoreDependencies } from './core/di/container'

export const configureContainer = () => {
	registerCoreDependencies()
}
