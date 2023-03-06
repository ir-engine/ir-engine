import appRootPath from 'app-root-path'
import cli from 'cli'
import dotenv from 'dotenv-flow'
import fs from 'fs'
import Sequelize, { DataTypes } from 'sequelize'

dotenv.config({
  path: appRootPath.path,
  silent: true
})

const db = {
  username: process.env.MYSQL_USER ?? 'server',
  password: process.env.MYSQL_PASSWORD ?? 'password',
  database: process.env.MYSQL_DATABASE ?? 'etherealengine',
  host: process.env.MYSQL_HOST ?? '127.0.0.1',
  port: process.env.MYSQL_PORT ?? 3306,
  dialect: 'mysql',
  url: ''
}

db.url = process.env.MYSQL_URL ?? `mysql://${db.username}:${db.password}@${db.host}:${db.port}/${db.database}`

cli.enable('status')

const options = cli.parse({
  service: [false, 'Name of failing service', 'string'],
  isDocker: [
    false,
    "Type of service, e.g. 'docker', or something else. Currently just based on whether or not it is 'docker'.",
    'boolean'
  ]
})

cli.main(async () => {
  try {
    const sequelizeClient = new Sequelize({
      ...db,
      logging: console.log,
      define: {
        freezeTableName: true
      }
    })

    await sequelizeClient.sync()

    const dateNow = new Date()

    const BuildStatus = sequelizeClient.define('build_status', {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },
      status: {
        type: DataTypes.STRING,
        defaultValue: 'pending'
      },
      logs: {
        type: DataTypes.TEXT
      },
      dateStarted: {
        type: DataTypes.DATE
      },
      dateEnded: {
        type: DataTypes.DATE
      }
    })

    const buildLogs = fs.readFileSync(`${options.service}-build-logs.txt`).toString()
    const buildErrors = fs.readFileSync(`${options.service}-build-error.txt`).toString()
    const builderRun = fs.readFileSync('builder-run.txt').toString()
    if (options.isDocker) {
      const hasError = /ERROR:/.test(buildErrors)
      if (hasError) {
        const combinedLogs = `Docker task that errored: ${options.service}\n\nTask logs:\n\n${buildErrors}`
        await BuildStatus.update(
          {
            status: 'failed',
            logs: combinedLogs,
            dateEnded: dateNow
          },
          {
            where: {
              id: builderRun
            }
          }
        )
        cli.exit(1)
      } else cli.exit(0)
    } else {
      const hasError = /error/i.test(buildErrors) || /fail/i.test(buildErrors)
      if (hasError) {
        const combinedLogs = `Task that errored: ${options.service}\n\nError logs:\n\n${buildErrors}\n\nTask logs:\n\n${buildLogs}`
        await BuildStatus.update(
          {
            status: 'failed',
            logs: combinedLogs,
            dateEnded: dateNow
          },
          {
            where: {
              id: builderRun
            }
          }
        )
        cli.exit(1)
      } else cli.exit(0)
    }
  } catch (err) {
    console.log(err)
    cli.fatal(err)
  }
})
