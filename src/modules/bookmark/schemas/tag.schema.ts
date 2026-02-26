import * as v from 'valibot'

import { APP_COLORS } from '@/common/constants/colors'

export const CreateTagSchema = v.object({
	name: v.pipe(
		v.string('Name is required'),
		v.minLength(1, 'Name cannot be empty'),
		v.maxLength(100, 'Name cannot exceed 100 characters')
	),
	color: v.picklist(APP_COLORS, 'Invalid color')
})

export const UpdateTagSchema = v.object({
	name: v.pipe(
		v.string('Name is required'),
		v.minLength(1, 'Name cannot be empty'),
		v.maxLength(100, 'Name cannot exceed 100 characters')
	),
	color: v.picklist(APP_COLORS, 'Invalid color')
})
