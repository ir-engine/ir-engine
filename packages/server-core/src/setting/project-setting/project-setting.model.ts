import { DataTypes, Model, Sequelize } from 'sequelize'

import { ProjectSettingInterface } from '@xrengine/common/src/dbmodels/ProjectSetting'

import { Application } from '../../../declarations'

export default (app: Application) => {
  const sequelizeClient: Sequelize = app.get('sequelizeClient')
  const ProjectSetting = sequelizeClient.define<Model<ProjectSettingInterface>>('projectSetting', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV1,
      allowNull: false,
      primaryKey: true
    },
    settings: {
      type: DataTypes.STRING,
      allowNull: true
    }
  })

  ;(ProjectSetting as any).associate = (models: any): void => {
    ;(ProjectSetting as any).belongsTo(models.project, { foreignKey: 'projectID' })
  }

  return ProjectSetting
}
