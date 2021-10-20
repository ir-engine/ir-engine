import { Sequelize, DataTypes } from 'sequelize'
import { Application } from '../../../declarations'

export default (app: Application): any => {
  const sequelizeClient: Sequelize = app.get('sequelizeClient')
  const instanceAttendance = sequelizeClient.define(
    'instance_attendance',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV1,
        allowNull: false,
        primaryKey: true
      },
      sceneId: {
        type: DataTypes.STRING
      },
      isChannel: {
        type: DataTypes.BOOLEAN
      },
      ended: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
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

  ;(instanceAttendance as any).associate = (models: any): void => {
    ;(instanceAttendance as any).belongsTo(models.instance)
    ;(instanceAttendance as any).belongsTo(models.user)
  }
  return instanceAttendance
}
