import type { Knex } from 'knex'

import appConfig from '@etherealengine/server-core/src/appconfig'

const config: Knex.Config = {
  client: 'mysql',
  connection: appConfig.db.url,
  migrations: {
    directory: './migrations',
    tableName: 'knex_migrations'
  }
}

// const config: Knex.Config = {
//     client: "sqlite3",
//     connection: {
//       filename: "./dev.sqlite3"
//     }
// }

module.exports = config
