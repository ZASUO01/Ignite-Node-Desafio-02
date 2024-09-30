import fastify from 'fastify'
import { userRoutes } from './routes/userRoutes'
import cookie from '@fastify/cookie'
import { mealRoutes } from './routes/mealsRoute'

export const app = fastify()

app.register(cookie)
app.register(userRoutes, { prefix: 'users' })
app.register(mealRoutes, { prefix: 'meals' })
