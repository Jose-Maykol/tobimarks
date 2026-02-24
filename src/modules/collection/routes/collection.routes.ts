import { Router } from 'express'
import { container } from 'tsyringe'

import type { CollectionController } from '../controllers/collection.controller'
import { COLLECTION_CONTROLLER } from '../di/token'
import {
	CreateCollectionSchema,
	GetCollectionsQuerySchema,
	UpdateCollectionSchema
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

router.patch(
	'/:id',
	validateRequest({ body: UpdateCollectionSchema }),
	collectionController.update.bind(collectionController)
)

export const collectionRoutes = router
