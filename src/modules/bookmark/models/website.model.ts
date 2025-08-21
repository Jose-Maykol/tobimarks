export interface Website {
	id: string
	domain: string
	name: string
	faviconUrl: string | null
	primaryColor: string | null
	bookmarkCount: number
	createdAt: Date
	updatedAt: Date
}

export type CreateWebsiteDto = Pick<Website, 'domain' | 'name' | 'faviconUrl'>
