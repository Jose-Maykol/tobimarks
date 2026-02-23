import * as v from 'valibot'

import type {
	CreateBookmarkSchema,
	GetBookmarksQuerySchema,
	UpdateBookmarkSchema
} from '../schemas/bookmark.schema'

export type CreateBookmarkRequestBody = v.InferInput<typeof CreateBookmarkSchema>
export type UpdateBookmarkRequestBody = v.InferInput<typeof UpdateBookmarkSchema>
export type GetBookmarksQuery = v.InferInput<typeof GetBookmarksQuerySchema>
export type GetBookmarksQueryOutput = v.InferOutput<typeof GetBookmarksQuerySchema>
