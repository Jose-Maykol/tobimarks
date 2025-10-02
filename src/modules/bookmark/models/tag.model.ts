export interface Tag {
	id: string
	userId: string
	name: string
	slug: string
	styleToken: string | null
	embedding: number[] | null
	createdAt: Date
	updatedAt: Date
}

export type CreateTagDto = Pick<Tag, 'userId' | 'name' | 'slug' | 'embedding' | 'styleToken'>

export type UpdateTagDto = Partial<Pick<Tag, 'id' | 'name' | 'slug' | 'styleToken'>>

export type TagListItemDto = Pick<Tag, 'id' | 'name' | 'slug' | 'styleToken'>
