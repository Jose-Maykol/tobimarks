import * as v from 'valibot'

export const GoogleAuthSchema = v.object({
	idToken: v.pipe(
		v.string('Id token es requerido'),
		v.minLength(1, 'Id token no puede estar vacío')
	)
})
