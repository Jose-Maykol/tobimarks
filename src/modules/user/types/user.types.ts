import type * as v from 'valibot'

import type { UpdateUserSettingsSchema } from '../schemas/user.schema'

export type UpdateUserSettingsRequestBody = v.InferInput<typeof UpdateUserSettingsSchema>
