// eslint-disable-next-line
import { Knex } from 'knex'

declare module 'knex/types/tables' {
  export interface Tables {
    users: {
      id: string
      email: string
      username: string
      created_at: string
      updated_at: string
      session_id?: string
    }
    meals: {
      id: string
      owner: string
      name: string
      description: string
      created_at: string
      updated_at: string
      on_diet: boolean
      date: number
    }
  }
}
