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

// A place in physical or virtual space, with many copies (instances)
import { DataTypes, Model, Sequelize } from 'sequelize'

import { LocationInterface } from '@etherealengine/common/src/dbmodels/Location'

import { Application } from '../../../declarations'

export default (app: Application) => {
  const sequelizeClient: Sequelize = app.get('sequelizeClient')
  const location = sequelizeClient.define<Model<LocationInterface>>(
    'location',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV1,
        allowNull: false,
        primaryKey: true
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false
      },
      sceneId: {
        type: DataTypes.STRING,
        allowNull: true
      },
      slugifiedName: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
      },
      isLobby: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
        defaultValue: false
      },
      isFeatured: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
        defaultValue: false
      },
      maxUsersPerInstance: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 50
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

  ;(location as any).associate = (models: any): void => {
    ;(location as any).hasMany(models.instance)
    ;(location as any).hasMany(models.location_admin)
    // (location as any).belongsTo(models.scene, { foreignKey: 'sceneId' }); // scene
    ;(location as any).belongsToMany(models.user, { through: 'location_admin' })
    ;(location as any).hasOne(models.location_settings, { onDelete: 'cascade' })
    ;(location as any).hasMany(models.location_ban)
    ;(location as any).hasMany(models.bot, { foreignKey: 'locationId' })
    ;(location as any).hasMany(models.location_authorized_user, { onDelete: 'cascade' })
  }

  return location
}
