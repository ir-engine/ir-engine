import { DataTypes, Model, Sequelize } from 'sequelize'

import { Application } from '@xrengine/server-core/declarations'

import { RoomInstanceInterface } from './RoomInstanceInterface'

/**
 * This model contains discord channel
 */
export default (app: Application) => {
  const sequelizeClient: Sequelize = app.get('sequelizeClient')
  const RoomInstance = sequelizeClient.define<Model<RoomInstanceInterface>>(
    'room_instance',
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
      instanceId: {
        type: DataTypes.STRING,
        allowNull: false
      },
      userId: {
        type: DataTypes.STRING,
        allowNull: false
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

  return RoomInstance
}
