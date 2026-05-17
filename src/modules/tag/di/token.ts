export const TAG_CONTROLLER = Symbol.for('TagController')
export const TAG_REPOSITORY = Symbol.for('ITagRepository')

// Use Cases
export const CREATE_TAG_USE_CASE = Symbol.for('CreateTagUseCase')
export const GET_TAGS_BY_USER_ID_USE_CASE = Symbol.for('GetTagsByUserIdUseCase')
export const UPDATE_TAG_USE_CASE = Symbol.for('UpdateTagUseCase')
export const DELETE_TAG_USE_CASE = Symbol.for('DeleteTagUseCase')
export const CHECK_TAGS_OWNERSHIP_USE_CASE = Symbol.for('CheckTagsOwnershipUseCase')
export const FIND_SIMILAR_TAGS_FOR_TEXT_USE_CASE = Symbol.for('FindSimilarTagsForTextUseCase')
