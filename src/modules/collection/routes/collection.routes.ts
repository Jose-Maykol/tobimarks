import { Router } from 'express'
import { container } from 'tsyringe'

import type { CollectionController } from '../controllers/collection.controller'
import { COLLECTION_CONTROLLER } from '../di/token'
import {
	CreateCollectionSchema,
	GetCollectionsQuerySchema,
	UpdateCollectionSchema,
	GetCollectionSchema
} from '../schemas/collection.schema'

import { authMiddleware } from '@/common/middlewares/auth.middleware'
import { validateRequest } from '@/common/middlewares/validation.middleware'

const router = Router()
const collectionController = container.resolve<CollectionController>(COLLECTION_CONTROLLER)

router.use(authMiddleware)

router.post(
	'/',
	validateRequest({ body: CreateCollectionSchema }),
	collectionController.create.bind(collectionController)
)

router.get(
	'/',
	validateRequest({ query: GetCollectionsQuerySchema }),
	collectionController.get.bind(collectionController)
)

router.get(
	'/:id',
	validateRequest({ params: GetCollectionSchema }),
	collectionController.getById.bind(collectionController)
)

router.patch(
	'/:id',
	validateRequest({ body: UpdateCollectionSchema }),
	collectionController.update.bind(collectionController)
)

/**
 * @openapi
 * /collections/{id}:
 *   delete:
 *     summary: Delete a collection
 *     description: Deletes an authenticated user's collection. Associated bookmarks remain available without a collection.
 *     tags:
 *       - Collections
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Collection deleted successfully
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.delete(
	'/:id',
	validateRequest({ params: GetCollectionSchema }),
	collectionController.delete.bind(collectionController)
)

export const collectionRoutes = router
