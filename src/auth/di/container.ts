import { container } from 'tsyringe'

import { AUTH_CONTROLLER, AUTH_SERVICE } from './tokens'
import { AuthController } from '../controllers/auth.controller'
import { AuthService } from '../services/auth.service'

container.register(AUTH_SERVICE, { useClass: AuthService })
container.register(AUTH_CONTROLLER, { useClass: AuthController })
