import * as v from 'valibot'

export const CreateBookmarkSchema = v.object({
	url: v.pipe(
		v.string('Url is required'),
		v.minLength(1, 'Url cannot be empty'),
		v.url('Invalid url format')
	)
})
