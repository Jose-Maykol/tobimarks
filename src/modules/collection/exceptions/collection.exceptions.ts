export class CollectionNotFoundError extends Error {
	constructor(public readonly code: string = 'COLLECTION_NOT_FOUND') {
		super('Collection not found')
		this.name = 'CollectionNotFoundError'
	}
}

export class CollectionAlreadyExistsError extends Error {
	constructor(public readonly code: string = 'COLLECTION_ALREADY_EXISTS') {
		super('You already have a collection with this name')
		this.name = 'CollectionAlreadyExistsError'
	}
}
