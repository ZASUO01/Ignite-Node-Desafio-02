import { FastifyReply, FastifyRequest } from 'fastify'
import { knex } from '../database'

export async function checkUserExists(req: FastifyRequest, res: FastifyReply) {
  const sessionId = req.cookies.session_id

  const userFound = await knex('users').where({ session_id: sessionId }).first()

  if (!userFound) {
    return res.status(401).send({
      error: 'Unauthorized 2',
    })
  }

  req.user = userFound
}
