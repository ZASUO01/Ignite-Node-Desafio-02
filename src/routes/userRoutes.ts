import { randomUUID } from 'node:crypto'
import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { knex } from '../database'

export async function userRoutes(app: FastifyInstance) {
  app.post('/', async (req, res) => {
    const createUserBodySchema = z.object({
      email: z.string().email(),
      username: z.string(),
    })

    const { email, username } = createUserBodySchema.parse(req.body)

    const userFound = await knex('users').where({ email }).first()

    if (userFound) {
      return res.status(400).send({ error: 'User already registered.' })
    }

    let sessionId = req.cookies.session_id

    if (!sessionId) {
      sessionId = randomUUID()

      res.setCookie('session_id', sessionId, {
        path: '/',
        maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
      })
    }

    await knex('users').insert({
      id: randomUUID(),
      email,
      username,
      session_id: sessionId,
    })

    return res.status(201).send()
  })
}
