/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/EtherealEngine/etherealengine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Ethereal Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Ethereal Engine team.

All portions of the code written by the Ethereal Engine team are Copyright © 2021-2023 
Ethereal Engine. All Rights Reserved.
*/

import appRootPath from 'app-root-path'
import cli from 'cli'
/* eslint-disable @typescript-eslint/no-var-requires */
import dotenv from 'dotenv-flow'
import Sequelize from 'sequelize'

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

    const Project = sequelizeClient.define('project', {
      id: {
        type: Sequelize.DataTypes.UUID,
        defaultValue: Sequelize.DataTypes.UUIDV1,
        allowNull: false,
        primaryKey: true
      },
      name: {
        type: Sequelize.DataTypes.STRING
      },
      thumbnail: {
        type: Sequelize.DataTypes.STRING
      },
      repositoryPath: {
        type: Sequelize.DataTypes.STRING
      },
      settings: {
        type: Sequelize.DataTypes.TEXT
      },
      needsRebuild: {
        type: Sequelize.DataTypes.BOOLEAN
      },
      commitSHA: {
        type: Sequelize.DataTypes.STRING
      }
    })

    await Project.update(
      {
        needsRebuild: false
      },
      { where: {} }
    )

    cli.ok(`Projects needsRebuild set to false`)

    process.exit(0)
  } catch (err) {
    console.log(err)
    cli.fatal(err)
  }
})
