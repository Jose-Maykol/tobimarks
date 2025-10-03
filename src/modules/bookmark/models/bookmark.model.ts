import type { TagSummaryDto } from './tag.model'
import type { Website } from './website.model'

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

export type BookmarkListItemDto = Pick<
	Bookmark,
	'id' | 'url' | 'title' | 'isFavorite' | 'isArchived' | 'accessCount'
> &
	Pick<Website, 'domain' | 'faviconUrl'> & { tags: TagSummaryDto[] }
