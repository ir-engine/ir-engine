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
    },
    ended: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    schema: {
      type: DataTypes.STRING,
      allowNull: false
    }
  })

  ;(Recording as any).associate = (models: any): void => {
    ;(Recording as any).belongsTo(models.user, {
      foreignKey: 'userId',
      as: 'user',
      allowNull: false,
      onDelete: 'cascade'
    })
  }
  return Recording
}
