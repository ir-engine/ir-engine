// See http://docs.sequelizejs.com/en/latest/docs/models-definition/
// for more of what you can do here.
import { DataTypes, Model, Sequelize } from 'sequelize'
import { HookReturn } from 'sequelize/types/lib/hooks'

import { Application } from '../../../declarations'

export default function (app: Application): typeof Model {
  const sequelizeClient: Sequelize = app.get('sequelizeClient')
  const rtcPorts = sequelizeClient.define(
    'rtc_ports',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV1,
        allowNull: false,
        primaryKey: true
      },
      start_port: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      end_port: {
        type: DataTypes.INTEGER,
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
  ;(rtcPorts as any).associate = function (models: any): void {
    // Define associations here
    // See http://docs.sequelizejs.com/en/latest/docs/associations/
  }

  return rtcPorts
}
