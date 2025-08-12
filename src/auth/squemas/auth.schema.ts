import * as v from 'valibot'

export const GoogleAuthSchema = v.object({
	idToken: v.string('Id token es requerido')
})
