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
	validateRequest({ body: CreateBookmarkSchema }),
	bookmarkController.create.bind(bookmarkController)
)
router.get('/', bookmarkController.get.bind(bookmarkController))
router.delete('/:id', bookmarkController.delete.bind(bookmarkController))
router.patch('/:id', bookmarkController.update.bind(bookmarkController))
router.patch('/:id/access', bookmarkController.registerAccess.bind(bookmarkController))
router.patch('/:id/favorite', bookmarkController.markAsFavorite.bind(bookmarkController))
router.delete('/:id/favorite', bookmarkController.unmarkAsFavorite.bind(bookmarkController))

export const bookmarkRoutes = router
