import fs from 'fs'
import type { Knex } from 'knex'
import path from 'path'

import appConfig from '@etherealengine/server-core/src/appconfig'

const migrationsDirectories: string[] = []

const parseDirectory = (directoryPath: string) => {
  const directoryContent = fs.readdirSync(directoryPath, { withFileTypes: true }).filter((dir) => dir.isDirectory())
  for (const directory of directoryContent) {
    const subFolder = path.join(directoryPath, directory.name)
    if (directory.name === 'migrations') {
      migrationsDirectories.push(subFolder)
    } else {
      parseDirectory(subFolder)
    }
  }
}

parseDirectory('./src')

const projectsDirectory = '../projects/projects'
const projectsExists = fs.existsSync(projectsDirectory)

if (projectsExists) {
  parseDirectory(projectsDirectory)
}

const config: Knex.Config = {
  client: 'mysql',
  connection: appConfig.db.url,
  migrations: {
    directory: migrationsDirectories,
    tableName: 'knex_migrations',
    stub: 'migration.stub',
    extension: 'ts',
    disableMigrationsListValidation: true
  },
  pool: {
    min: 5,
    max: 30
  }
}

// const config: Knex.Config = {
//     client: "sqlite3",
//     connection: {
//       filename: "./dev.sqlite3"
//     }
// }

module.exports = config
