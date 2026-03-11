export interface RefreshToken {
	id: string
	userId: string
	tokenHash: string
	deviceId: string | null
	deviceName: string | null
	userAgent: string | null
	ipAddress: string | null
	expiresAt: Date
	createdAt: Date
	lastUsedAt: Date
	isActive: boolean
}

export type CreateRefreshTokenDto = Pick<
	RefreshToken,
	'userId' | 'tokenHash' | 'deviceId' | 'deviceName' | 'userAgent' | 'ipAddress' | 'expiresAt'
>

export type UpdateRefreshTokenDto = Partial<
	Pick<RefreshToken, 'tokenHash' | 'expiresAt' | 'lastUsedAt' | 'isActive'>
>
