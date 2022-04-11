import cli from 'cli'
import { Sequelize } from 'sequelize'

const db = {
  username: process.env.MYSQL_USER ?? 'server',
  password: process.env.MYSQL_PASSWORD ?? 'password',
  database: process.env.MYSQL_DATABASE ?? 'xrengine',
  host: process.env.MYSQL_HOST ?? '127.0.0.1',
  port: process.env.MYSQL_PORT ?? 3306,
  dialect: 'mysql'
} as any

db.url = process.env.MYSQL_URL ?? `mysql://${db.username}:${db.password}@${db.host}:${db.port}/${db.database}`

cli.enable('status')

const sequelize = new Sequelize({
  ...db,
  logging: false,
  define: {
    freezeTableName: true
  }
})

cli.main(async () => {
  await sequelize.sync()

  const [results] = await sequelize.query("SHOW TABLES LIKE 'user';")

  if (results.length === 0) {
    console.log('database not found')
  } else {
    console.log('database found')
  }

  process.exit(0)
})
