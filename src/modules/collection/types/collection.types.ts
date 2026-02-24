import * as v from 'valibot'

import type {
	CreateCollectionSchema,
	UpdateCollectionSchema,
	GetCollectionsQuerySchema
} from '../schemas/collection.schema'

export type CreateCollectionRequestBody = v.InferInput<typeof CreateCollectionSchema>
export type UpdateCollectionRequestBody = v.InferInput<typeof UpdateCollectionSchema>
export type GetCollectionsQuery = v.InferInput<typeof GetCollectionsQuerySchema>
export type GetCollectionsQueryOutput = v.InferOutput<typeof GetCollectionsQuerySchema>
