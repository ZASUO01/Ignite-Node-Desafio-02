import { FastifyInstance } from 'fastify'
import { checkSessionIdExists } from '../middlewares/check-session-id-exists'
import { knex } from '../database'
import { checkUserExists } from '../middlewares/check-user-exists'
import { z } from 'zod'
import { randomUUID } from 'node:crypto'

export async function mealRoutes(app: FastifyInstance) {
  app.post(
    '/',
    { preHandler: [checkSessionIdExists, checkUserExists] },
    async (req, res) => {
      const createMealBodySchema = z.object({
        name: z.string(),
        description: z.string(),
        onDiet: z.boolean(),
        date: z.coerce.date(),
      })

      const { name, description, onDiet, date } = createMealBodySchema.parse(
        req.body,
      )

      await knex('meals').insert({
        id: randomUUID(),
        owner: req.user?.id,
        name,
        description,
        on_diet: onDiet,
        date: date.getTime(),
      })

      return res.status(201).send()
    },
  )

  app.put(
    '/:id',
    { preHandler: [checkSessionIdExists, checkUserExists] },
    async (req, res) => {
      const paramsSchema = z.object({ id: z.string().uuid() })

      const { id } = paramsSchema.parse(req.params)

      const updateMealBodySchema = z.object({
        name: z.string(),
        description: z.string(),
        onDiet: z.boolean(),
        date: z.coerce.date(),
      })

      const { name, description, onDiet, date } = updateMealBodySchema.parse(
        req.body,
      )

      const meal = await knex('meals').where({ id }).first()

      if (!meal) {
        return res.status(404).send({ error: 'Meal not found' })
      }

      await knex('meals').where({ id }).update({
        name,
        description,
        on_diet: onDiet,
        date: date.getTime(),
      })

      return res.status(204).send()
    },
  )

  app.delete(
    '/:id',
    { preHandler: [checkSessionIdExists, checkUserExists] },
    async (req, res) => {
      const paramsSchema = z.object({ id: z.string().uuid() })

      const { id } = paramsSchema.parse(req.params)

      const meal = await knex('meals').where({ id }).first()

      if (!meal) {
        return res.status(404).send({ error: 'Meal not found' })
      }

      await knex('meals').where({ id }).delete()

      return res.status(204).send()
    },
  )

  app.get(
    '/',
    { preHandler: [checkSessionIdExists, checkUserExists] },
    async (req, res) => {
      const meals = await knex('meals')
        .where('owner', req.user?.id)
        .orderBy('date', 'desc')

      return res.send({ meals })
    },
  )

  app.get(
    '/:id',
    { preHandler: [checkSessionIdExists, checkUserExists] },
    async (req, res) => {
      const paramsSchema = z.object({ id: z.string().uuid() })

      const { id } = paramsSchema.parse(req.params)

      const meal = await knex('meals').where({ id }).first()

      if (!meal) {
        return res.status(404).send({ error: 'Meal not found' })
      }

      return res.send({ meal })
    },
  )

  app.get(
    '/metrics',
    { preHandler: [checkSessionIdExists, checkUserExists] },
    async (req, res) => {
      const totalMealsOnDiet = await knex('meals')
        .where({ owner: req.user?.id, on_diet: true })
        .count('id', { as: 'total' })
        .first()

      const totalMealsOffDiet = await knex('meals')
        .where({ owner: req.user?.id, on_diet: false })
        .count('id', { as: 'total' })
        .first()

      const totalMeals = await knex('meals')
        .where({ owner: req.user?.id })
        .orderBy('date', 'desc')

      const { bestOnDietSequence } = totalMeals.reduce(
        (acc, meal) => {
          if (meal.on_diet) {
            acc.currentSequence += 1
          } else {
            acc.currentSequence = 0
          }

          if (acc.currentSequence > acc.bestOnDietSequence) {
            acc.bestOnDietSequence = acc.currentSequence
          }

          return acc
        },
        { bestOnDietSequence: 0, currentSequence: 0 },
      )

      return res.send({
        totalMeals: totalMeals.length,
        totalMealsOnDiet: totalMealsOnDiet?.total,
        totalMealsOffDiet: totalMealsOffDiet?.total,
        bestOnDietSequence,
      })
    },
  )
}
