export interface Collection {
	id: string
	userId: string
	name: string
	description: string | null
	bookmarksCount: number
	createdAt: Date
	updatedAt: Date
}

export type CreateCollectionDto = Pick<Collection, 'userId' | 'name' | 'description'>

export type UpdateCollectionDto = Partial<Pick<Collection, 'name' | 'description'>>
