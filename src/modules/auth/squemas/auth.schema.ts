import * as v from 'valibot'

export const GoogleAuthSchema = v.object({
	idToken: v.pipe(
		v.string('Id token es requerido'),
		v.minLength(1, 'Id token no puede estar vacío')
	),
	deviceId: v.optional(v.string()),
	deviceName: v.optional(v.string())
})

export const RefreshTokenSchema = v.object({
	refreshToken: v.pipe(
		v.string('Refresh token es requerido'),
		v.minLength(1, 'Refresh token no puede estar vacío')
	),
	deviceId: v.optional(v.string()),
	deviceName: v.optional(v.string())
})
