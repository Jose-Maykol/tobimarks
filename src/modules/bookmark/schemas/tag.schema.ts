import * as v from 'valibot'

export const CreateTagSchema = v.object({
	name: v.pipe(
		v.string('Name is required'),
		v.minLength(1, 'Name cannot be empty'),
		v.maxLength(100, 'Name cannot exceed 100 characters')
	),
	// TODO: CREATE AN ENUM FOR TAG STYLES
	color: v.pipe(
		v.string('Color is required'),
		v.minLength(1, 'Color cannot be empty'),
		v.maxLength(100, 'Color cannot exceed 100 characters')
	)
})

export const UpdateTagSchema = v.object({
	name: v.pipe(
		v.string('Name is required'),
		v.minLength(1, 'Name cannot be empty'),
		v.maxLength(100, 'Name cannot exceed 100 characters')
	),
	color: v.pipe(
		v.string('Color is required'),
		v.minLength(1, 'Color cannot be empty'),
		v.maxLength(100, 'Color cannot exceed 100 characters')
	)
})
