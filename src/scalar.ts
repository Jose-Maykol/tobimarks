import { type ApiReferenceConfiguration } from '@scalar/express-api-reference'

import { env } from './core/config/env.config'
import { swaggerSpec } from './swagger'

/**
 * Base configuration for the Scalar API Reference.
 * Provides a modern, clean interface for exploring the Tobimarks API.
 */
export const scalarConfig: ApiReferenceConfiguration = {
	spec: {
		content: swaggerSpec
	},

	theme: 'deepSpace',
	layout: 'modern',
	darkMode: true,

	showSidebar: true,
	hideDownloadButton: env.NODE_ENV === 'PRODUCTION',
	hideTestRequestButton: false,
	hideDarkModeToggle: false,
	hideModels: false,

	// Custom branding and metadata
	metaData: {
		title: 'Tobimarks API Reference',
		description:
			'Comprehensive API documentation for Tobimarks - Your intelligent bookmark manager.',
		ogDescription:
			'Explore the Tobimarks API for managing bookmarks, collections, and AI insights.',
		ogTitle: 'Tobimarks API Docs',
		ogImage: 'https://tobimarks.com/og-image.png' // Adjust if you have a real URL
	},

	// Header configuration
	customCss: `
		.scalar-header {
			border-bottom: 1px solid var(--scalar-border-color);
		}
	`
}

/**
 * Generates environment-specific Scalar configuration.
 * Useful if you need to differentiate docs based on where they are hosted.
 */
export const getScalarConfig = (
	currentEnv: typeof env.NODE_ENV = env.NODE_ENV
): ApiReferenceConfiguration => {
	const baseConfig = { ...scalarConfig }

	if (currentEnv === 'DEVELOPMENT') {
		return {
			...baseConfig,
			darkMode: true,
			servers: [
				{
					url: `http://localhost:${env.PORT}/api`,
					description: 'Local Development Server'
				}
			]
		}
	}

	if (currentEnv === 'PRODUCTION') {
		return {
			...baseConfig,
			hideDownloadButton: true,
			servers: [
				{
					url: 'https://api.tobimarks.com/api', // Adjust to your actual production URL
					description: 'Production Server'
				}
			]
		}
	}

	return baseConfig
}
