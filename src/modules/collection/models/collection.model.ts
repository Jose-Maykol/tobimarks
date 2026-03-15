import type { AppColor } from '@/common/constants/colors'
import type { AppIcon } from '@/common/constants/icons'

export interface Collection {
	id: string
	userId: string
	name: string
	description: string | null
	color: AppColor | null
	icon: AppIcon | null
	bookmarksCount: number
	embedding?: number[]
	createdAt: Date
	updatedAt: Date
}

export type CreateCollectionDto = Pick<
	Collection,
	'userId' | 'name' | 'description' | 'color' | 'icon' | 'embedding'
>

export type UpdateCollectionDto = Partial<
	Pick<Collection, 'name' | 'description' | 'color' | 'icon' | 'embedding'>
>
