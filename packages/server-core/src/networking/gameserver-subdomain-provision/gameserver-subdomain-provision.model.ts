// See http://docs.sequelizejs.com/en/latest/docs/models-definition/
// for more of what you can do here.
import { Sequelize, DataTypes, Model } from 'sequelize'
import { Application } from '../../../declarations'
import { HookReturn } from 'sequelize/types/lib/hooks'

export default function (app: Application): typeof Model {
  const sequelizeClient: Sequelize = app.get('sequelizeClient')
  const gameserverSubdomainProvision = sequelizeClient.define(
    'gameserver_subdomain_provision',
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },
      gs_id: {
        type: DataTypes.STRING,
        allowNull: true
      },
      gs_number: {
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
  ;(gameserverSubdomainProvision as any).associate = function (models: any): void {
    // (gameserverSubdomainProvision as any).belongsTo(models.instance);
    // Define associations here
    // See http://docs.sequelizejs.com/en/latest/docs/associations/
  }

  return gameserverSubdomainProvision
}
