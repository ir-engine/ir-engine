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

import {
  InstanceInterface,
  InstanceserverSubdomainProvisionInterface
} from '@etherealengine/common/src/dbmodels/Instance'

import { HookReturn } from 'sequelize/types/hooks'
import { Application } from '../../../declarations'

export default (app: Application) => {
  const sequelizeClient: Sequelize = app.get('sequelizeClient')
  const instance = sequelizeClient.define<Model<InstanceInterface>>(
    'instance',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV1,
        allowNull: false,
        primaryKey: true
      },
      roomCode: {
        type: DataTypes.STRING,
        allowNull: false
      },
      ipAddress: {
        type: DataTypes.STRING
      },
      channelId: {
        type: DataTypes.STRING
      },
      podName: {
        type: DataTypes.STRING
      },
      currentUsers: {
        type: DataTypes.INTEGER,
        defaultValue: 0
      },
      ended: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
      },
      assigned: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
      },
      assignedAt: {
        type: DataTypes.DATE
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

  ;(instance as any).associate = (models: any): void => {
    ;(instance as any).belongsTo(models.location, { foreignKey: { allowNull: true } })
    ;(instance as any).hasOne(createInstanceServerSubdomainProvisionModel(app), { foreignKey: { allowNull: true } })
    ;(instance as any).hasMany(models.bot, { foreignKey: { allowNull: true } })
    ;(instance as any).belongsToMany(models.user, { through: 'instance_authorized_user' })
    ;(instance as any).hasMany(models.instance_authorized_user, { foreignKey: { allowNull: false } })
    ;(instance as any).hasMany(models.user_kick, { onDelete: 'cascade' })
  }
  return instance
}

export const createInstanceServerSubdomainProvisionModel = (app: Application) => {
  const sequelizeClient: Sequelize = app.get('sequelizeClient')
  const instanceServerSubdomainProvision = sequelizeClient.define<Model<InstanceserverSubdomainProvisionInterface>>(
    'instance-server-subdomain-provision',
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },
      isId: {
        type: DataTypes.STRING,
        allowNull: true
      },
      isNumber: {
        type: DataTypes.STRING,
        allowNull: false
      },
      allocated: {
        type: DataTypes.BOOLEAN
      }
    },
    {
      hooks: {
        beforeCount(options: any): HookReturn {
          options.raw = true
        }
      }
    }
  )

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  ;(instanceServerSubdomainProvision as any).associate = function (models: any): void {
    // (instanceSeserverSubdomainProvision as any).belongsTo(models.instance);
    // Define associations here
    // See http://docs.sequelizejs.com/en/latest/docs/associations/
  }

  return instanceServerSubdomainProvision
}
