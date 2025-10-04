import * as v from 'valibot'

import type { CreateBookmarkSchema, UpdateBookmarkSchema } from '../schemas/bookmark.schema'

export type CreateBookmarkRequestBody = v.InferInput<typeof CreateBookmarkSchema>
export type UpdateBookmarkRequestBody = v.InferInput<typeof UpdateBookmarkSchema>
