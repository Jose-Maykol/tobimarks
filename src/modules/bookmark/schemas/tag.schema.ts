import * as v from 'valibot'

export const CreateTagSchema = v.object({
	name: v.pipe(
		v.string('El nombre es requerido'),
		v.minLength(1, 'El nombre no puede estar vacío'),
		v.maxLength(100, 'El nombre no puede exceder los 100 caracteres')
	),
	//TODO: CREAR UN ENUM PARA ESTILOS DE TAGS
	styleToken: v.pipe(
		v.string('El styleToken es requerido'),
		v.minLength(1, 'El styleToken no puede estar vacío'),
		v.maxLength(100, 'El styleToken no puede exceder los 100 caracteres')
	)
})

export const UpdateTagSchema = v.object({
	name: v.pipe(
		v.string('El nombre es requerido'),
		v.minLength(1, 'El nombre no puede estar vacío'),
		v.maxLength(100, 'El nombre no puede exceder los 100 caracteres')
	),
	styleToken: v.pipe(
		v.string('El styleToken es requerido'),
		v.minLength(1, 'El styleToken no puede estar vacío'),
		v.maxLength(100, 'El styleToken no puede exceder los 100 caracteres')
	)
})
