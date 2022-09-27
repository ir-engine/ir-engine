// See http://docs.sequelizejs.com/en/latest/docs/models-definition/
// for more of what you can do here.
import { DataTypes, Model, Sequelize } from 'sequelize'
import { HookReturn } from 'sequelize/types/hooks'

import { InstanceserverSubdomainProvisionInterface } from '@xrengine/common/src/dbmodels/InstanceserverSubdomainProvision'

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
