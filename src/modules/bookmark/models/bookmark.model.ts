import type { TagSummaryDto } from './tag.model'
import type { Website } from './website.model'

export interface Bookmark {
	id: string
	userId: string
	websiteId: string
	url: string
	title: string | null
	description: string | null
	ogTitle: string | null
	ogDescription: string | null
	ogImageUrl: string | null
	collectionId: string | null
	isFavorite: boolean
	isArchived: boolean
	lastAccessedAt: Date | null
	accessCount: number
	searchVector: string
	createdAt: Date
	updatedAt: Date
	deletedAt: Date | null
}

export type CreateBookmarkDto = Pick<
	Bookmark,
	| 'userId'
	| 'websiteId'
	| 'url'
	| 'title'
	| 'description'
	| 'ogTitle'
	| 'ogDescription'
	| 'ogImageUrl'
	| 'collectionId'
	| 'isFavorite'
	| 'isArchived'
>

export type UpdateBookmarkDto = Partial<Pick<Bookmark, 'title' | 'collectionId'>> & {
	tags?: string[]
}

export type BookmarkListItemDto = Pick<
	Bookmark,
	'id' | 'url' | 'title' | 'isFavorite' | 'isArchived' | 'accessCount' | 'lastAccessedAt'
> &
	Pick<Website, 'domain' | 'faviconUrl'> & { tags: TagSummaryDto[] }

export interface BookmarkFilters {
	isFavorite?: boolean | undefined
	tags?: string[] | undefined
	collectionId?: string | null | undefined
	sortBy?: 'createdAt' | 'lastAccessedAt' | 'accessCount' | undefined
	sortDirection?: 'asc' | 'desc' | undefined
	accessedWithin?: 'week' | 'month' | 'all' | undefined
}
