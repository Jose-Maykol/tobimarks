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
	//settings: Record<string, unknown>
}

export type CreateUserDto = Pick<User, 'googleId' | 'email' | 'displayName' | 'avatarUrl'>
