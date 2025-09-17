export interface Tag {
	id: string
	userId: string
	name: string
	slug: string
	usageCount: number
	createdAt: Date
	updatedAt: Date
}

export type CreateTagDto = Pick<Tag, 'userId' | 'name' | 'slug'>
