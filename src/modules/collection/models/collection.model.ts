import type { AppColor } from '@/common/constants/colors'

export interface Collection {
	id: string
	userId: string
	name: string
	description: string | null
	color: AppColor | null
	bookmarksCount: number
	createdAt: Date
	updatedAt: Date
}

export type CreateCollectionDto = Pick<Collection, 'userId' | 'name' | 'description' | 'color'>

export type UpdateCollectionDto = Partial<Pick<Collection, 'name' | 'description' | 'color'>>
