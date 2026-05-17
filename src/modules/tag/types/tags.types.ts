import * as v from 'valibot'

import type { CreateTagSchema, UpdateTagSchema } from '../schemas/tag.schema'

export type CreateTagRequestBody = v.InferInput<typeof CreateTagSchema>
export type UpdateTagRequestBody = v.InferInput<typeof UpdateTagSchema>
