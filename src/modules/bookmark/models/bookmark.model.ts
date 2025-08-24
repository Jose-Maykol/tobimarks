export interface Bookmark {
	id: string
	userId: string
	websiteId: string
	categoryId: string | null
	url: string
	title: string | null
	description: string | null
	ogTitle: string | null
	ogDescription: string | null
	ogImageUrl: string | null
	isFavorite: boolean
	isArchived: boolean
	createdAt: Date
	updatedAt: Date
	lastAccessedAt: Date | null
	accessCount: number
	searchVector: string
}

export type CreateBookmarkDto = Pick<
	Bookmark,
	| 'userId'
	| 'websiteId'
	| 'categoryId'
	| 'url'
	| 'title'
	| 'description'
	| 'ogTitle'
	| 'ogDescription'
	| 'ogImageUrl'
	| 'isFavorite'
	| 'isArchived'
>
