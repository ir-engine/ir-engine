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

// See http://docs.sequelizejs.com/en/latest/docs/models-definition/
// for more of what you can do here.
import { DataTypes, Model, Sequelize } from 'sequelize'
import { HookReturn } from 'sequelize/types/hooks'

import { InstanceserverSubdomainProvisionInterface } from '@etherealengine/common/src/dbmodels/InstanceserverSubdomainProvision'

import { Application } from '../../../declarations'

export default (app: Application) => {
  const sequelizeClient: Sequelize = app.get('sequelizeClient')
  const instanceserverSubdomainProvision = sequelizeClient.define<Model<InstanceserverSubdomainProvisionInterface>>(
    'instanceserver_subdomain_provision',
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },
      is_id: {
        type: DataTypes.STRING,
        allowNull: true
      },
      is_number: {
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
  ;(instanceserverSubdomainProvision as any).associate = function (models: any): void {
    // (instancseserverSubdomainProvision as any).belongsTo(models.instance);
    // Define associations here
    // See http://docs.sequelizejs.com/en/latest/docs/associations/
  }

  return instanceserverSubdomainProvision
}
