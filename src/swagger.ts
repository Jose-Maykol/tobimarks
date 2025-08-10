import swaggerJSDoc from 'swagger-jsdoc'

const options: swaggerJSDoc.Options = {
	definition: {
		openapi: '3.0.0',
		info: {
			title: 'Tobimarks',
			version: '1.0.0',
			description: 'API documentation for my application'
		},
		servers: [
			{
				url: 'http://localhost:3000',
				description: 'Development server'
			}
		]
	},

	apis: []
}

export const swaggerSpec = swaggerJSDoc(options)
