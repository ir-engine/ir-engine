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

/* eslint-disable @typescript-eslint/no-var-requires */
const dotenv = require('dotenv-flow')
const cli = require('cli')
const Sequelize = require('sequelize')

const { scopeTypeSeed } = require('../packages/server-core/src/scope/scope-type/scope-type.seed')

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
  dialect: 'mysql'
}

db.url = process.env.MYSQL_URL ?? `mysql://${db.username}:${db.password}@${db.host}:${db.port}/${db.database}`

cli.enable('status')

const options = cli.parse({
  id: [false, 'ID of user to make admin', 'string']
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

    const User = sequelizeClient.define('user', {
      id: {
        type: Sequelize.DataTypes.UUID,
        defaultValue: Sequelize.DataTypes.UUIDV1,
        allowNull: false,
        primaryKey: true
      },
      name: {
        type: Sequelize.DataTypes.STRING,
        allowNull: false
      },
      isGuest: {
        type: Sequelize.DataTypes.BOOLEAN,
        defaultValue: true,
        allowNull: false
      }
    })

    const Scope = sequelizeClient.define('scope', {
      id: {
        type: Sequelize.DataTypes.UUID,
        defaultValue: Sequelize.DataTypes.UUIDV1,
        allowNull: false,
        primaryKey: true
      },
      userId: {
        type: Sequelize.DataTypes.STRING,
        allowNull: true
      },
      type: {
        type: Sequelize.DataTypes.STRING,
        allowNull: false
      }
    })

    const userMatch = await User.findOne({
      where: {
        id: options.id
      }
    })

    if (userMatch != null) {
      await userMatch.save()
      for (const { type } of scopeTypeSeed) {
        try {
          const existingScope = await Scope.findOne({ where: { userId: options.id, type } })
          if (existingScope == null) await Scope.create({ userId: options.id, type })
        } catch (e) {
          console.log(e)
        }
      }

      cli.ok(`User with id ${options.id} made an admin`)
    } else {
      cli.ok(`User with id ${options.id} does not exist`)
    }

    process.exit(0)
  } catch (err) {
    console.log(err)
    cli.fatal(err)
  }
})
