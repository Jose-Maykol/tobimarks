export interface Bookmark {
	id: string
	userId: string
	websiteId: string
	categoryId: string | null
	url: string
	title: string
	metaTitle: string | null
	metaDescription: string | null
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
	| 'metaTitle'
	| 'metaDescription'
	| 'ogImageUrl'
	| 'isFavorite'
	| 'isArchived'
>
