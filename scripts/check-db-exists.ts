import dotenv from 'dotenv'
import cli from 'cli'
import { Sequelize } from 'sequelize'
import { spawn } from 'child_process'

dotenv.config()
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
  logging: true,
  define: {
    freezeTableName: true
  }
})

cli.main(async () => {
  await sequelize.sync()

  const [results] = await sequelize.query("SHOW TABLES LIKE 'user';")

  if (results.length === 0) {
    console.log('User table not found, seeding the database...')

    const initPromise = new Promise((resolve) => {
      const initProcess = spawn('npm', ['run', 'init-db-production'])
      initProcess.once('exit', resolve)
      initProcess.once('error', resolve)
      initProcess.once('disconnect', resolve)
      initProcess.stdout.on('data', (data) => console.log(data.toString()))
    }).then(console.log)

    await Promise.race([
      initPromise,
      new Promise<void>((resolve) => {
        setTimeout(() => {
          console.log('WARNING: Initialisation too long to launch!')
          resolve()
        }, 5 * 60 * 1000) // timeout after 5 minutes - it needs to be this long as the default project is uploaded to the storage provider in this time
      })
    ])
  } else {
    console.log('Database found')
  }

  process.exit(0)
})
