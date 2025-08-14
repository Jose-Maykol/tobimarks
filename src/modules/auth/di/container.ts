import { container } from 'tsyringe'

import { AUTH_CONTROLLER, AUTH_SERVICE } from './tokens'
import { AuthController } from '../controllers/auth.controller'
import { AuthService } from '../services/auth.service'
import { TokenService } from '../services/token.service'

import { TOKEN_SERVICE } from '@/modules/user/di/tokens'

export const registerAuthDependencies = () => {
	container.register(AUTH_SERVICE, { useClass: AuthService })
	container.register(AUTH_CONTROLLER, { useClass: AuthController })
	container.register(TOKEN_SERVICE, { useClass: TokenService })
}
