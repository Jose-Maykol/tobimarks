import { container } from 'tsyringe'

import {
	CHECK_TAGS_OWNERSHIP_USE_CASE,
	CREATE_TAG_USE_CASE,
	DELETE_TAG_USE_CASE,
	FIND_SIMILAR_TAGS_FOR_TEXT_USE_CASE,
	GET_TAGS_BY_USER_ID_USE_CASE,
	TAG_CONTROLLER,
	TAG_REPOSITORY,
	UPDATE_TAG_USE_CASE
} from './token'
import { TagController } from '../controllers/tag.controller'
import { TagRepository } from '../repositories/tag.repository'
import { CheckTagsOwnershipUseCase } from '../use-cases/check-tags-ownership.use-case'
import { CreateTagUseCase } from '../use-cases/create-tag.use-case'
import { DeleteTagUseCase } from '../use-cases/delete-tag.use-case'
import { FindSimilarTagsForTextUseCase } from '../use-cases/find-similar-tags-for-text.use-case'
import { GetTagsByUserIdUseCase } from '../use-cases/get-tags-by-user-id.use-case'
import { UpdateTagUseCase } from '../use-cases/update-tag.use-case'

export const registerTagDependencies = () => {
	// Repositories
	container.register(TAG_REPOSITORY, {
		useClass: TagRepository
	})

	// Controllers
	container.register(TAG_CONTROLLER, {
		useClass: TagController
	})

	// Use Cases
	container.register(CREATE_TAG_USE_CASE, {
		useClass: CreateTagUseCase
	})
	container.register(GET_TAGS_BY_USER_ID_USE_CASE, {
		useClass: GetTagsByUserIdUseCase
	})
	container.register(UPDATE_TAG_USE_CASE, {
		useClass: UpdateTagUseCase
	})
	container.register(DELETE_TAG_USE_CASE, {
		useClass: DeleteTagUseCase
	})
	container.register(CHECK_TAGS_OWNERSHIP_USE_CASE, {
		useClass: CheckTagsOwnershipUseCase
	})
	container.register(FIND_SIMILAR_TAGS_FOR_TEXT_USE_CASE, {
		useClass: FindSimilarTagsForTextUseCase
	})
}
