import { DataTypes, Model, Sequelize } from 'sequelize'

import { RecordingInterface } from '@etherealengine/common/src/dbmodels/Recording'

import { Application } from '../../../declarations'

export default (app: Application) => {
  const sequelizeClient: Sequelize = app.get('sequelizeClient')
  const Recording = sequelizeClient.define<Model<RecordingInterface>>('recording', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV1,
      allowNull: false,
      primaryKey: true
    }
  })

  ;(Recording as any).associate = (models: any): void => {
    ;(Recording as any).belongsTo(models.user, { foreignKey: 'userId', allowNull: false, onDelete: 'cascade' })
  }
  return Recording
}
