import * as v from 'valibot'

import { PaginationQuerySchema } from '@/common/schemas/pagination.schema'

export const CreateCollectionSchema = v.object({
	name: v.pipe(
		v.string('Name is required'),
		v.minLength(1, 'Name cannot be empty'),
		v.maxLength(100, 'Name cannot exceed 100 characters')
	),
	description: v.optional(v.nullable(v.string('Description must be a string')))
})

export const UpdateCollectionSchema = v.object({
	name: v.optional(
		v.pipe(
			v.string('Name must be a string'),
			v.minLength(1, 'Name cannot be empty'),
			v.maxLength(100, 'Name cannot exceed 100 characters')
		)
	),
	description: v.optional(v.nullable(v.string('Description must be a string')))
})

export const GetCollectionsQuerySchema = v.intersect([
	PaginationQuerySchema,
	v.object({}) // Can add filters later if needed
])
