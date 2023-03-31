import fs from 'fs'
import type { Knex } from 'knex'
import path from 'path'

import appConfig from '@etherealengine/server-core/src/appconfig'

const migrationsDirectories = ['./migrations']

const projectsDirectory = '../projects/projects'
const installedProjects = fs.readdirSync(projectsDirectory)
for (const project of installedProjects) {
  const projectMigrations = path.join(projectsDirectory, project, 'migrations')
  const migrationExists = fs.existsSync(projectMigrations)
  if (migrationExists) {
    migrationsDirectories.push(projectMigrations)
  }
}

const config: Knex.Config = {
  client: 'mysql',
  connection: appConfig.db.url,
  migrations: {
    directory: migrationsDirectories,
    tableName: 'knex_migrations',
    stub: 'migration.stub',
    extension: 'ts'
  },
  pool: {
    min: 2,
    max: 10
  }
}

// const config: Knex.Config = {
//     client: "sqlite3",
//     connection: {
//       filename: "./dev.sqlite3"
//     }
// }

module.exports = config
