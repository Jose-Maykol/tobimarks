import { Router } from 'express'
import { container } from 'tsyringe'

import type { TagController } from '../controllers/tag.controller'
import { TAG_CONTROLLER } from '../di/token'
import { CreateTagSchema } from '../schemas/tag.schema'

import { authMiddleware } from '@/common/middlewares/auth.middleware'
import { validateRequest } from '@/common/middlewares/validation.middleware'

const router = Router()
const tagController = container.resolve<TagController>(TAG_CONTROLLER)

router.use(authMiddleware)
router.get('/', tagController.getByUserId.bind(tagController))
router.post(
	'/',
	validateRequest({ body: CreateTagSchema }),
	tagController.create.bind(tagController)
)
router.patch('/:id', tagController.update.bind(tagController))
router.delete('/:id', tagController.delete.bind(tagController))

router.use(authMiddleware)

export const tagRoutes = router
