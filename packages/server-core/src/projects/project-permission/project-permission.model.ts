import { DataTypes, Model, Sequelize } from 'sequelize'

import { ProjectPermissionInterface } from '@xrengine/common/src/dbmodels/ProjectPermission'

import { Application } from '../../../declarations'

export default (app: Application) => {
  const sequelizeClient: Sequelize = app.get('sequelizeClient')
  const ProjectPermission = sequelizeClient.define<Model<ProjectPermissionInterface>>(
    'project_permission',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV1,
        allowNull: false,
        primaryKey: true
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

  ;(ProjectPermission as any).associate = (models: any): void => {
    ;(ProjectPermission as any).belongsTo(models.user, { foreignKey: 'userId', allowNull: false, onDelete: 'cascade' })
    ;(ProjectPermission as any).belongsTo(models.project, {
      foreignKey: 'projectId',
      allowNull: false,
      onDelete: 'cascade'
    })
    ;(ProjectPermission as any).belongsTo(models.project_permission_type, { foreignKey: 'type' })
  }

  return ProjectPermission
}
