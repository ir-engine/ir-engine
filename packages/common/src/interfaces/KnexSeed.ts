import { Knex } from 'knex'

export interface KnexSeed {
  seed: (knex: Knex) => Promise<void>
}
