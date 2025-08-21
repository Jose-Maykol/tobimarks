import { container } from 'tsyringe'

import { AUTH_CONTROLLER, AUTH_SERVICE, GOOGLE_AUTH_SERVICE, TOKEN_SERVICE } from './tokens'
import { AuthController } from '../controllers/auth.controller'
import { AuthService } from '../services/auth.service'
import { GoogleAuthService } from '../services/google-auth.service'
import { TokenService } from '../services/token.service'

export const registerAuthDependencies = () => {
	container.register(GOOGLE_AUTH_SERVICE, { useClass: GoogleAuthService })
	container.register(AUTH_SERVICE, { useClass: AuthService })
	container.register(AUTH_CONTROLLER, { useClass: AuthController })
	container.register(TOKEN_SERVICE, { useClass: TokenService })
}
