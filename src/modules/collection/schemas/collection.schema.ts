import * as v from 'valibot'

import { APP_COLORS } from '@/common/constants/colors'
import { APP_ICONS } from '@/common/constants/icons'
import { PaginationQuerySchema } from '@/common/schemas/pagination.schema'

export const CreateCollectionSchema = v.object({
	name: v.pipe(
		v.string('Name is required'),
		v.minLength(1, 'Name cannot be empty'),
		v.maxLength(100, 'Name cannot exceed 100 characters')
	),
	description: v.optional(v.nullable(v.string('Description must be a string'))),
	color: v.optional(v.nullable(v.picklist(APP_COLORS, 'Invalid color'))),
	icon: v.optional(v.nullable(v.picklist(APP_ICONS, 'Invalid icon')), 'folder')
})

export const UpdateCollectionSchema = v.object({
	name: v.optional(
		v.pipe(
			v.string('Name must be a string'),
			v.minLength(1, 'Name cannot be empty'),
			v.maxLength(100, 'Name cannot exceed 100 characters')
		)
	),
	description: v.optional(v.nullable(v.string('Description must be a string'))),
	color: v.optional(v.nullable(v.picklist(APP_COLORS, 'Invalid color'))),
	icon: v.optional(v.nullable(v.picklist(APP_ICONS, 'Invalid icon')))
})

export const GetCollectionsQuerySchema = v.intersect([PaginationQuerySchema, v.object({})])

export const GetCollectionSchema = v.object({
	id: v.pipe(v.string('Collection ID must be a string'), v.uuid('Invalid UUID format'))
})
