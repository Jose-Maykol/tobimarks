import swaggerJSDoc from 'swagger-jsdoc'

const options: swaggerJSDoc.Options = {
	definition: {
		openapi: '3.0.0',
		info: {
			title: 'Tobimarks API',
			version: '1.0.0',
			description:
				'Tobimarks is a modern bookmark management API with AI capabilities. Organize your bookmarks into collections, tags, and get AI-generated insights.',
			contact: {
				name: 'Tobimarks Support',
				url: 'https://tobimarks.com'
			},
			license: {
				name: 'MIT',
				url: 'https://opensource.org/licenses/MIT'
			}
		},
		servers: [
			{
				url: 'http://localhost:3000/api',
				description: 'Development server'
			}
		],
		components: {
			securitySchemes: {
				bearerAuth: {
					type: 'http',
					scheme: 'bearer',
					bearerFormat: 'JWT'
				}
			},
			responses: {
				UnauthorizedError: {
					description: 'Access token is missing or invalid',
					content: {
						'application/json': {
							schema: {
								$ref: '#/components/schemas/ErrorResponse'
							}
						}
					}
				},
				ForbiddenError: {
					description: 'You do not have permission to access this resource',
					content: {
						'application/json': {
							schema: {
								$ref: '#/components/schemas/ErrorResponse'
							}
						}
					}
				},
				NotFoundError: {
					description: 'The requested resource was not found',
					content: {
						'application/json': {
							schema: {
								$ref: '#/components/schemas/ErrorResponse'
							}
						}
					}
				}
			},
			schemas: {
				ErrorResponse: {
					type: 'object',
					properties: {
						success: { type: 'boolean', example: false },
						error: {
							type: 'object',
							properties: {
								message: { type: 'string' },
								code: { type: 'string' }
							}
						}
					}
				},
				SuccessResponse: {
					type: 'object',
					properties: {
						success: { type: 'boolean', example: true },
						data: { type: 'object' }
					}
				}
			}
		},
		security: [
			{
				bearerAuth: []
			}
		]
	},

	apis: [
		'./src/modules/**/*.routes.ts',
		'./src/modules/**/*.controller.ts',
		'./src/modules/**/*.schema.ts'
	]
}

export const swaggerSpec = swaggerJSDoc(options)
