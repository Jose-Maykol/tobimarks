import * as v from 'valibot'

import { PaginationQuerySchema } from '@/common/schemas/pagination.schema'

export const CreateBookmarkSchema = v.object({
	url: v.pipe(
		v.string('Url is required'),
		v.minLength(1, 'Url cannot be empty'),
		v.url('Invalid url format')
	),
	collectionId: v.optional(
		v.nullable(v.pipe(v.string('Collection ID must be a string'), v.uuid('Invalid UUID format')))
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
	),
	collectionId: v.optional(
		v.nullable(v.pipe(v.string('Collection ID must be a string'), v.uuid('Invalid UUID format')))
	)
})

export const GetBookmarksQuerySchema = v.intersect([
	PaginationQuerySchema,
	v.object({
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
		sortBy: v.optional(v.picklist(['createdAt', 'lastAccessedAt', 'accessCount'])),
		sortDirection: v.optional(v.picklist(['asc', 'desc'])),
		accessedWithin: v.optional(v.picklist(['week', 'month', 'all']))
	})
])
