import * as v from 'valibot'

export const CreateBookmarkSchema = v.object({
	url: v.pipe(
		v.string('Url is required'),
		v.minLength(1, 'Url cannot be empty'),
		v.url('Invalid url format')
	)
})

export const UpdateBookmarkSchema = v.object({
	title: v.optional(
		v.pipe(
			v.string('Title is required'),
			v.minLength(1, 'Title cannot be empty'),
			v.maxLength(500, 'Title cannot exceed 500 characters')
		)
	),
	tags: v.optional(
		v.array(v.pipe(v.string('Each tag must be a valid UUID'), v.uuid('Invalid UUID format')))
	)
})

export const GetBookmarksQuerySchema = v.object({
	isFavorite: v.optional(
		v.pipe(
			v.string(),
			v.transform((val) => val === 'true')
		)
	),
	tags: v.optional(
		v.pipe(
			v.string(),
			v.transform((val) => val.split(',').filter(Boolean))
		)
	),
	sortBy: v.optional(v.picklist(['createdAt', 'lastAccessedAt'])),
	sortDirection: v.optional(v.picklist(['asc', 'desc']))
})
