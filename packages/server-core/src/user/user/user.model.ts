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

import { AvatarInterface, UserInterface } from '@etherealengine/common/src/dbmodels/UserInterface'

import { Application } from '../../../declarations'

/**
 * This model contain users information
 */
export default (app: Application) => {
  const sequelizeClient: Sequelize = app.get('sequelizeClient')
  const User = sequelizeClient.define<Model<UserInterface>>(
    'user',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV1,
        allowNull: false,
        primaryKey: true
      },
      name: {
        type: DataTypes.STRING,
        defaultValue: (): string => 'Guest #' + Math.floor(Math.random() * (999 - 100 + 1) + 100),
        allowNull: false
      },
      isGuest: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
        allowNull: false
      },
      inviteCode: {
        type: DataTypes.STRING,
        unique: true
      },
      did: {
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

  ;(User as any).associate = (models: any): void => {
    ;(User as any).hasMany(models.instance_attendance, { as: 'instanceAttendance' })
    ;(User as any).hasOne(models.user_settings)
    ;(User as any).belongsTo(models.party, { through: 'party_user' }) // user can only be part of one party at a time
    ;(User as any).belongsToMany(models.user, {
      as: 'relatedUser',
      through: models.user_relationship
    })
    ;(User as any).hasMany(models.user_relationship, { onDelete: 'cascade' })
    ;(User as any).belongsToMany(models.group, { through: 'group_user' }) // user can join multiple orgs
    ;(User as any).hasMany(models.group_user, { unique: false, onDelete: 'cascade' })
    ;(User as any).hasMany(models.identity_provider, { onDelete: 'cascade' })
    // ;(User as any).hasMany(models.static_resource)
    // (User as any).hasMany(models.subscription);
    ;(User as any).hasMany(models.channel, { foreignKey: 'userId1', onDelete: 'cascade' })
    ;(User as any).hasMany(models.channel, { foreignKey: 'userId2', onDelete: 'cascade' })
    // (User as any).hasOne(models.seat, { foreignKey: 'userId' });
    ;(User as any).belongsToMany(models.location, { through: 'location_admin' })
    ;(User as any).hasMany(models.location_admin, { unique: false })
    ;(User as any).hasMany(models.location_ban)
    ;(User as any).hasMany(models.bot, { foreignKey: 'userId' })
    ;(User as any).hasMany(models.scope, { foreignKey: 'userId', onDelete: 'cascade' })
    ;(User as any).belongsToMany(models.instance, { through: 'instance_authorized_user' })
    ;(User as any).hasMany(models.instance_authorized_user, { foreignKey: { allowNull: false } })
    ;(User as any).hasOne(models.user_api_key)
    ;(User as any).belongsTo(createAvatarModel(app))
    ;(User as any).hasMany(models.user_kick, { onDelete: 'cascade' })
  }

  return User
}

export const createAvatarModel = (app: Application) => {
  const sequelizeClient: Sequelize = app.get('sequelizeClient')
  const Avatar = sequelizeClient.define<Model<AvatarInterface>>(
    'avatar',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV1,
        allowNull: false,
        primaryKey: true
      },
      name: {
        type: DataTypes.STRING,
        allowNull: true
      },
      identifierName: {
        type: DataTypes.STRING,
        unique: true
      },
      modelResourceId: {
        type: DataTypes.STRING
      },
      thumbnailResourceId: {
        type: DataTypes.STRING
      },
      isPublic: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
      },
      userId: {
        type: DataTypes.UUID
      },
      project: {
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

  ;(Avatar as any).associate = (models: any): void => {
    ;(Avatar as any).hasMany(models.user)
  }

  return Avatar
}
