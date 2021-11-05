import { DataTypes, Model, Sequelize } from 'sequelize'
import { Application } from '../../../declarations'

export type ProjectModelType = {
  id: string
  name: string
  thumbnail: string
  storageProviderPath: string
  repositoryPath: string
}

export default (app: Application) => {
  const sequelizeClient: Sequelize = app.get('sequelizeClient')
  const Project = sequelizeClient.define<Model<ProjectModelType>>(
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
      storageProviderPath: {
        type: DataTypes.STRING
      },
      repositoryPath: {
        type: DataTypes.STRING
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
  ;(Project as any).associate = (models: any): void => {}

  return Project
}
