import { type ApiReferenceConfiguration } from '@scalar/express-api-reference'
import { swaggerSpec } from './swagger'

export const scalarConfig: ApiReferenceConfiguration = {
  spec: {
    content: swaggerSpec,
  },
  
  theme: 'deepSpace',
  layout: 'modern',
  darkMode: false,
  
  showSidebar: true,
  hideDownloadButton: false,
  hideTestRequestButton: false,
  hideDarkModeToggle: true,
  hideModels: false,
  
  metaData: {
    title: 'Tobimarks API Documentation',
    description: 'Comprehensive API documentation for the Tobimarks application',
    ogDescription: 'Tobimarks API - Complete reference guide',
    ogTitle: 'Tobimarks API Docs',
  },
}

/* export const getScalarConfig = (env: 'development' | 'staging' | 'production' = 'development'): ApiReferenceConfiguration => {
  const baseConfig = { ...scalarConfig }
  
  switch (env) {
    case 'development':
      return {
        ...baseConfig,
        darkMode: true,
        hideDownloadButton: false,
        servers: [
          {
            url: 'http://localhost:3000',
            description: 'Development server',
          },
        ],
      }
    
    case 'staging':
      return {
        ...baseConfig,
        servers: [
          {
            url: 'https://staging-api.tobimarks.com',
            description: 'Staging server',
          },
        ],
      }
    
    case 'production':
      return {
        ...baseConfig,
        hideDownloadButton: true,
        servers: [
          {
            url: 'https://api.tobimarks.com',
            description: 'Production server',
          },
        ],
      }
    
    default:
      return baseConfig
  }
} */

/* export const setAuthToken = (token: string): ApiReferenceConfiguration => {
  return {
    ...scalarConfig,
    authentication: {
      ...scalarConfig.authentication,
      apiKey: {
        token,
      },
    },
  }
} */