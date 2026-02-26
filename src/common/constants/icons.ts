export const APP_ICONS = [
	'folder',
	'star',
	'heart',
	'bookmark',
	'archive',
	'tag',
	'code',
	'book',
	'music',
	'video',
	'image',
	'link',
	'briefcase',
	'globe',
	'shopping-cart'
] as const

export type AppIcon = (typeof APP_ICONS)[number]
