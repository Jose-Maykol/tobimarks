import * as v from 'valibot'

export const UpdateUserSettingsSchema = v.object({
	aiAutoTags: v.optional(v.boolean()),
	aiAutoCollections: v.optional(v.boolean())
})
