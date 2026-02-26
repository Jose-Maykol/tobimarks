export interface UserSettings {
	aiAutoTags: boolean
	aiAutoCollections: boolean
}

export interface User {
	id: string
	googleId: string
	email: string
	displayName: string
	avatarUrl: string | null
	createdAt: Date
	updatedAt: Date
	lastLoginAt: Date | null
	isActive: boolean
	settings: UserSettings
}

export type CreateUserDto = Pick<User, 'googleId' | 'email' | 'displayName' | 'avatarUrl'>

export type ProfileUserDto = Pick<User, 'id' | 'email' | 'displayName' | 'avatarUrl' | 'settings'>
