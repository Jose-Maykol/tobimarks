import * as v from 'valibot'

import type { CreateTagSchema } from '../schemas/tag.schema'

export type CreateTagRequestBody = v.InferInput<typeof CreateTagSchema>
