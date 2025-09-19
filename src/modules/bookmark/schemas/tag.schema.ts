import * as v from 'valibot'

export const CreateTagSchema = v.object({
	name: v.pipe(
		v.string('El nombre es requerido'),
		v.minLength(1, 'El nombre no puede estar vacío'),
		v.maxLength(100, 'El nombre no puede exceder los 100 caracteres')
	)
})

export const UpdateTagSchema = v.object({
	name: v.pipe(
		v.string('El nombre es requerido'),
		v.minLength(1, 'El nombre no puede estar vacío'),
		v.maxLength(100, 'El nombre no puede exceder los 100 caracteres')
	)
})
