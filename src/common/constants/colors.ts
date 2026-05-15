/**
 * Lista de colores disponibles en la aplicación.
 * Estos colores se utilizan generalmente para etiquetas, carpetas y personalización de la interfaz.
 */
export const APP_COLORS = [
	'red',
	'orange',
	'amber',
	'yellow',
	'lime',
	'green',
	'emerald',
	'teal',
	'cyan',
	'sky',
	'blue',
	'indigo',
	'violet',
	'purple',
	'fuchsia',
	'pink',
	'rose',
	'stone'
] as const

export type AppColor = (typeof APP_COLORS)[number]
