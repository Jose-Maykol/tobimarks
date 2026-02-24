import * as v from 'valibot'

export const PaginationQuerySchema = v.object({
	page: v.optional(
		v.pipe(
			v.string(),
			v.transform(Number),
			v.number('Page must be a number'),
			v.integer('Page must be an integer'),
			v.minValue(1, 'Page must be greater than or equal to 1')
		),
		'1'
	),
	limit: v.optional(
		v.pipe(
			v.string(),
			v.transform(Number),
			v.number('Limit must be a number'),
			v.integer('Limit must be an integer'),
			v.minValue(1, 'Limit must be greater than or equal to 1'),
			v.maxValue(100, 'Limit cannot exceed 100')
		),
		'10'
	)
})

export type PaginationQuery = v.InferInput<typeof PaginationQuerySchema>
export type PaginationQueryOutput = v.InferOutput<typeof PaginationQuerySchema>
