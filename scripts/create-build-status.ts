import appRootPath from 'app-root-path'
import cli from 'cli'
/* eslint-disable @typescript-eslint/no-var-requires */
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
  charset: 'utf8mb4',
  collate: 'utf8mb4_general_ci',
  url: ''
}

db.url = process.env.MYSQL_URL ?? `mysql://${db.username}:${db.password}@${db.host}:${db.port}/${db.database}`

cli.enable('status')

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
      },
      commitSHA: {
        type: DataTypes.STRING
      }
    })

    await BuildStatus.sync()

    await BuildStatus.update(
      {
        status: 'ended',
        dateEnded: dateNow
      },
      {
        where: {
          status: 'pending'
        }
      }
    )

    const newBuildStatus = await BuildStatus.create({
      dateStarted: dateNow,
      commitSHA: process.env.TAG ? process.env.TAG.split('_')[1] : ''
    })

    const path = appRootPath.path + `/builder-run.txt`
    fs.writeFileSync(path, newBuildStatus.id.toString())

    cli.exit(0)
  } catch (err) {
    console.log(err)
    cli.fatal(err)
  }
})
