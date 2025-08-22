import * as v from 'valibot'

import type { CreateBookmarkSchema } from '../schemas/bookmark.schema'

export type CreateBookmarkRequestBody = v.InferInput<typeof CreateBookmarkSchema>
