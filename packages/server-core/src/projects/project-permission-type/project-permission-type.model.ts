import { DataTypes, Model, Sequelize } from 'sequelize'

import { ScopeTypeInterface } from '@xrengine/common/src/dbmodels/ScopeType'

import { Application } from '../../../declarations'

export default (app: Application) => {
  const sequelizeClient: Sequelize = app.get('sequelizeClient')
  const ProjectPermissionType = sequelizeClient.define<Model<ScopeTypeInterface>>(
    'project_permission_type',
    {
      type: {
        type: DataTypes.STRING,
        allowNull: false,
        primaryKey: true,
        unique: true
      }
    },
    {
      hooks: {
        beforeCount(options: any): void {
          options.raw = true
        }
      },
      timestamps: false
    }
  )
  ;(ProjectPermissionType as any).associate = (models: any): void => {
    ;(ProjectPermissionType as any).hasMany(models.project_permission, { foreignKey: 'type' })
  }

  return ProjectPermissionType
}
