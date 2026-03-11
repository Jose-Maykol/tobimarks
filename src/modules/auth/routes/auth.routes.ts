import { Router } from 'express'
import { container } from 'tsyringe'

import { AuthController } from '../controllers/auth.controller'
import { AUTH_CONTROLLER } from '../di/tokens'
import { GoogleAuthSchema, RefreshTokenSchema } from '../squemas/auth.schema'

import { validateRequest } from '@/common/middlewares/validation.middleware'

const router = Router()
const authController = container.resolve<AuthController>(AUTH_CONTROLLER)

router.post(
	'/google',
	validateRequest({ body: GoogleAuthSchema }),
	authController.googleAuth.bind(authController)
)
router.post(
	'/refresh',
	validateRequest({ body: RefreshTokenSchema }),
	authController.refreshToken.bind(authController)
)
router.post(
	'/logout',
	validateRequest({ body: RefreshTokenSchema }),
	authController.logout.bind(authController)
)

export const authRouter = router
