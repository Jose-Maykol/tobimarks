import type { AppColor } from '@/common/constants/colors'

export interface Tag {
	id: string
	userId: string
	name: string
	slug: string
	color: AppColor | null
	embedding: number[] | null
	createdAt: Date
	updatedAt: Date
}

export type CreateTagDto = Pick<Tag, 'userId' | 'name' | 'slug' | 'embedding' | 'color'>

export type UpdateTagDto = Partial<Pick<Tag, 'id' | 'name' | 'slug' | 'color'>>

export type TagListItemDto = Pick<Tag, 'id' | 'name' | 'slug' | 'color'>

export type TagSummaryDto = Pick<Tag, 'id' | 'name' | 'slug' | 'color'>
