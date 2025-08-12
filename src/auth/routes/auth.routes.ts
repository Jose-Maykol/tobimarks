import { Router } from 'express'
import { container } from 'tsyringe'

import { AuthController } from '../controllers/auth.controller'
import { AUTH_CONTROLLER } from '../di/tokens'
import { GoogleAuthSchema } from '../squemas/auth.schema'

import { validateRequest } from '@/common/middlewares/validation'

const router = Router()
const authController = container.resolve<AuthController>(AUTH_CONTROLLER)

router.post(
	'/google',
	validateRequest({ body: GoogleAuthSchema }),
	authController.googleAuth.bind(authController)
)
router.post('/refresh', authController.refreshToken.bind(authController))
router.post('/logout', authController.logout.bind(authController))
