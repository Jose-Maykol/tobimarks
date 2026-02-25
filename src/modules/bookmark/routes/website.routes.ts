import { Router } from 'express'
import { container } from 'tsyringe'

import type { WebsiteController } from '../controllers/website.controller'
import { WEBSITE_CONTROLLER } from '../di/token'

import { authMiddleware } from '@/common/middlewares/auth.middleware'

const router = Router()
const websiteController = container.resolve<WebsiteController>(WEBSITE_CONTROLLER)

router.use(authMiddleware)
router.get('/', websiteController.getByUserId.bind(websiteController))

export const websiteRoutes = router
