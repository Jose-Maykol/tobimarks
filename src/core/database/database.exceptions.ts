export class UniqueConstraintViolationError extends Error {
	constructor(public readonly detail?: string) {
		super('Unique constraint violated')
	}
}
