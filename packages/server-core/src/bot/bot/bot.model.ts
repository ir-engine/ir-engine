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

import { DataTypes, Model, Sequelize } from 'sequelize'

import { Application } from '../../../declarations'

interface BotCommandInterface {
  id: string
  name: string
  description?: string
}

export default (app: Application) => {
  const sequelizeClient: Sequelize = app.get('sequelizeClient')
  const Bot = sequelizeClient.define(
    'bot',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV1,
        allowNull: false,
        primaryKey: true
      },
      name: {
        type: DataTypes.STRING,
        defaultValue: (): string => 'etherealengine bot' + Math.floor(Math.random() * (999 - 100 + 1) + 100),
        allowNull: false
      },
      description: {
        type: DataTypes.STRING,
        allowNull: true
      }
    },
    {
      hooks: {
        beforeCount(options: any): void {
          options.raw = true
        }
      }
    }
  )

  ;(Bot as any).associate = (models: any): void => {
    ;(Bot as any).belongsTo(models.location, { foreignKey: 'locationId' })
    ;(Bot as any).belongsTo(models.instance, { foreignKey: { allowNull: true } })
    ;(Bot as any).belongsTo(models.user, { foreignKey: 'userId' })
    ;(Bot as any).hasMany(createBotCommandModel(app), { foreignKey: 'botId' })
  }
  return Bot
}

export const createBotCommandModel = (app: Application) => {
  const sequelizeClient: Sequelize = app.get('sequelizeClient')
  const BotCommand = sequelizeClient.define<Model<BotCommandInterface>>(
    'botCommand',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV1,
        allowNull: false,
        primaryKey: true
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
      },
      description: {
        type: DataTypes.STRING,
        allowNull: true
      }
    },
    {
      hooks: {
        beforeCount(options: any): void {
          options.raw = true
        }
      }
    }
  )
  ;(BotCommand as any).associate = (models: any): void => {
    ;(BotCommand as any).belongsTo(models.bot, { foreignKey: 'botId' })
  }

  return BotCommand
}
