import { createRoute, OpenAPIHono } from '@hono/zod-openapi'
import { Scalar } from '@scalar/hono-api-reference'
import { cache } from 'hono/cache'
import { cors } from 'hono/cors'
import { csrf } from 'hono/csrf'
import { logger } from 'hono/logger'
import { ParamsSchema, UserSchema } from './schemas/user.dto'

/**
 * Zod OpenAPI
 * https://hono.dev/examples/zod-openapi
 */
const app = new OpenAPIHono()

const route = createRoute({
  method: 'get',
  path: '/users/{id}',
  request: {
    params: ParamsSchema
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: UserSchema
        }
      },
      description: 'Retrieve the user'
    }
  }
})

app.openapi(route, (c) => {
  const { id } = c.req.valid('param')
  return c.json({
    id,
    age: 17,
    name: 'Ultemica'
  })
})

/**
 * Zod OpenAPI
 * https://hono.dev/examples/zod-openapi
 */
app.doc('/openapi.json', {
  openapi: '3.0.0',
  info: {
    version: '1.0.0',
    title: 'Hono Zod OpenAPI Example'
  }
})

app.use(
  '*',
  logger(),
  cors(),
  csrf(),
  cache({
    cacheName: 'hono-cache',
    cacheControl: 'public, max-age=3600'
  })
)
app.notFound((c) => c.redirect('/docs'))
app.get('/docs', Scalar({ url: '/openapi.json' }))

export default {
  port: 8787,
  fetch: app.fetch
}
