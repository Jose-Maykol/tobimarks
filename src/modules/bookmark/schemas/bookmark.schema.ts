import * as v from 'valibot'

export const CreateBookmarkSchema = v.object({
	url: v.pipe(
		v.string('Url es requerida'),
		v.minLength(1, 'Url no puede estar vacía'),
		v.url('Formato de url inválido')
	)
})
