import { Router } from 'express'
import { container } from 'tsyringe'

import type { BookmarkController } from '../controllers/bookmark.controller'
import { BOOKMARK_CONTROLLER } from '../di/token'
import { CreateBookmarkSchema } from '../schemas/bookmark.schema'

import { authMiddleware } from '@/common/middlewares/auth.middleware'
import { validateRequest } from '@/common/middlewares/validation.middleware'

const router = Router()
const bookmarkController = container.resolve<BookmarkController>(BOOKMARK_CONTROLLER)

router.use(authMiddleware)

router.post(
	'/',
	validateRequest({
		body: CreateBookmarkSchema
	}),
	bookmarkController.create.bind(bookmarkController)
)

/*
 */

export const bookmarkRoutes = router
