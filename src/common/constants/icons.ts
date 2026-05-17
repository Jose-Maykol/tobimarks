/**
 * Lista de identificadores de iconos disponibles en la aplicación.
 * Estos iconos se utilizan para representar diferentes tipos de recursos o categorías.
 */
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
