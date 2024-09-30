import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { app } from '../src/app'
import { execSync } from 'node:child_process'
import request from 'supertest'

describe('Users routes', () => {
  beforeAll(async () => {
    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })

  beforeEach(() => {
    execSync('npm run knex -- migrate:rollback --all')
    execSync('npm run knex -- migrate:latest')
  })

  it('should be able to create a new user', async () => {
    const response = await request(app.server)
      .post('/users')
      .send({
        username: 'john doe',
        email: 'johndoe@gmail.com',
      })
      .expect(201)

    const cookie = response.get('Set-Cookie')

    expect(cookie).toEqual(
      expect.arrayContaining([expect.stringContaining('session_id')]),
    )
  })
})
