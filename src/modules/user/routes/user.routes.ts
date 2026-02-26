import { Router } from 'express'
import { container } from 'tsyringe'

import type { UserController } from '../controllers/user.controller'
import { USER_CONTROLLER } from '../di/tokens'
import { UpdateUserSettingsSchema } from '../schemas/user.schema'

import { authMiddleware } from '@/common/middlewares/auth.middleware'
import { validateRequest } from '@/common/middlewares/validation.middleware'

const router = Router()
const userController = container.resolve<UserController>(USER_CONTROLLER)

router.use(authMiddleware)
router.get('/me', userController.getProfile.bind(userController))
router.patch(
	'/me/settings',
	validateRequest({ body: UpdateUserSettingsSchema }),
	userController.updateSettings.bind(userController)
)

export const userRoutes = router
