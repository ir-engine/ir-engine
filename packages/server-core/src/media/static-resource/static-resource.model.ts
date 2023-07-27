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

import { StaticResourceInterface } from '@etherealengine/common/src/dbmodels/StaticResource'

import { Application } from '../../../declarations'
import generateShortId from '../../util/generate-short-id'

export default (app: Application) => {
  const sequelizeClient: Sequelize = app.get('sequelizeClient')
  const staticResource = sequelizeClient.define<Model<StaticResourceInterface>>(
    'static_resource',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV1,
        allowNull: false,
        primaryKey: true
      },
      sid: {
        type: DataTypes.STRING,
        defaultValue: (): string => generateShortId(8),
        allowNull: false
      },
      hash: {
        type: DataTypes.STRING,
        allowNull: false
      },
      url: {
        type: DataTypes.STRING,
        allowNull: true
      },
      key: {
        type: DataTypes.STRING
      },
      mimeType: {
        type: DataTypes.STRING,
        allowNull: true
      },
      metadata: {
        type: DataTypes.JSON,
        allowNull: true
      },
      project: {
        type: DataTypes.STRING,
        allowNull: true
      },
      driver: {
        type: DataTypes.STRING
      },
      licensing: {
        type: DataTypes.STRING
      },
      attribution: {
        type: DataTypes.STRING
      },
      tags: {
        type: DataTypes.JSON
      },
      stats: {
        type: DataTypes.JSON
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

  ;(staticResource as any).associate = (models: any): void => {
    ;(staticResource as any).belongsTo(models.user)
  }

  return staticResource
}
