/* eslint-disable @typescript-eslint/restrict-template-expressions */
import { inspect } from 'util'
// Load all the ENV variables from `.env`, then `.env.local`, into process.env
import dotenv from 'dotenv-flow'
dotenv.config()

/**
 * Database configuration
 */
const db: any = {
  username: process.env.MYSQL_USER ?? 'server',
  password: process.env.MYSQL_PASSWORD ?? 'password',
  database: process.env.MYSQL_DATABASE ?? 'xrchat',
  host: process.env.MYSQL_HOST ?? 'localhost',
  port: process.env.MYSQL_PORT ?? 3306,
  dialect: 'mysql',
  forceRefresh: process.env.FORCE_DB_REFRESH === 'true'
}
db.url = process.env.MYSQL_URL ??
  `mysql://${db.username}:${db.password}@${db.host}:${db.port}/${db.database}`

/**
 * Server / backend configuration
 */
const server: any = {
  hostname: process.env.SERVER_HOSTNAME ?? 'localhost',
  port: process.env.SERVER_PORT ?? 3030
}
server.url = process.env.SERVER_URL ?? 'http://localhost:3030'

/**
 * Client / frontend configuration
 */
const client: any = {
  url: process.env.APP_URL ??
    process.env.APP_HOST ?? // Legacy env var, to deprecate
    'http://localhost:3000'
}

/**
 * Full config
 */
const config: any = {
  db,
  server,
  client
}

console.log(inspect(config))

export default config
