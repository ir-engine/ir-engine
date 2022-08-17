import { DataTypes, Model, Sequelize } from 'sequelize'

import { ProjectInterface } from '@xrengine/common/src/dbmodels/Project'

import { Application } from '../../../declarations'

export default (app: Application) => {
  const sequelizeClient: Sequelize = app.get('sequelizeClient')
  const Project = sequelizeClient.define<Model<ProjectInterface>>(
    'project',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV1,
        allowNull: false,
        primaryKey: true
      },
      name: {
        type: DataTypes.STRING
      },
      thumbnail: {
        type: DataTypes.STRING
      },
      repositoryPath: {
        type: DataTypes.STRING
      },
      settings: {
        type: DataTypes.TEXT
      },
      needsRebuild: {
        type: DataTypes.BOOLEAN
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

  ;(Project as any).associate = (models: any): void => {
    ;(Project as any).hasMany(models.project_permission, {
      foreignKey: 'projectId',
      allowNull: false,
      onDelete: 'cascade'
    })
  }

  return Project
}
