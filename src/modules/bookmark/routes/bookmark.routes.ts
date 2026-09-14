import { Router } from 'express'
import { container } from 'tsyringe'

import type { BookmarkController } from '../controllers/bookmark.controller'
import { BOOKMARK_CONTROLLER } from '../di/token'
import {
	CreateBookmarkSchema,
	GetBookmarksQuerySchema,
	UpdateBookmarkCollectionSchema
} from '../schemas/bookmark.schema'

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
router.get(
	'/',
	validateRequest({ query: GetBookmarksQuerySchema }),
	bookmarkController.get.bind(bookmarkController)
)
router.delete('/:id', bookmarkController.delete.bind(bookmarkController))
router.patch('/:id', bookmarkController.update.bind(bookmarkController))
/**
 * @openapi
 * /bookmarks/{id}/archive:
 *   patch:
 *     summary: Archive a bookmark
 *     tags: [Bookmarks]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Bookmark archived successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.patch('/:id/archive', bookmarkController.archive.bind(bookmarkController))
router.patch(
	'/:id/collection',
	validateRequest({ body: UpdateBookmarkCollectionSchema }),
	bookmarkController.updateCollection.bind(bookmarkController)
)
router.delete('/:id/collection', bookmarkController.removeCollection.bind(bookmarkController))
router.patch('/:id/access', bookmarkController.registerAccess.bind(bookmarkController))
router.patch('/:id/favorite', bookmarkController.markAsFavorite.bind(bookmarkController))
router.delete('/:id/favorite', bookmarkController.unmarkAsFavorite.bind(bookmarkController))

export const bookmarkRoutes = router
