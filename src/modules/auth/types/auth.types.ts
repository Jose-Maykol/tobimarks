import jwt from 'jsonwebtoken'
import * as v from 'valibot'

import type { GoogleAuthSchema, RefreshTokenSchema } from '../squemas/auth.schema'

export type GoogleAuthRequestBody = v.InferInput<typeof GoogleAuthSchema>
export type RefreshTokenRequestBody = v.InferInput<typeof RefreshTokenSchema>

export interface AccessTokenPayload extends jwt.JwtPayload {
	sub: string
	email: string
}

export interface GoogleAuthPayload {
	googleId: string
	email: string
	name: string
	picture: string | undefined
}

export interface DeviceMetadata {
	deviceId?: string | undefined
	deviceName?: string | undefined
	userAgent?: string | undefined
	ipAddress?: string | undefined
}
