import * as v from 'valibot'

import type { GoogleAuthSchema } from '../squemas/auth.schema'

export type GoogleAuthInput = v.InferInput<typeof GoogleAuthSchema>
