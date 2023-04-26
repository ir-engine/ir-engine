import { DataTypes, Model, Sequelize } from 'sequelize'

import { RecordingResourceInterface } from '@etherealengine/common/src/dbmodels/Recording'

import { Application } from '../../../declarations'

export default (app: Application) => {
  const sequelizeClient: Sequelize = app.get('sequelizeClient')
  const RecordingResource = sequelizeClient.define<Model<RecordingResourceInterface>>('recording_resource', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV1,
      allowNull: false,
      primaryKey: true
    }
  })

  ;(RecordingResource as any).associate = (models: any): void => {
    ;(RecordingResource as any).belongsTo(models.recording, { required: true, allowNull: false })
    ;(RecordingResource as any).belongsTo(models.static_resource, { required: true, allowNull: false })
  }
  return RecordingResource
}
