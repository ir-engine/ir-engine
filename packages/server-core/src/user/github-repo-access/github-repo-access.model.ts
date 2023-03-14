import { DataTypes, Model, Sequelize } from 'sequelize'

import { GithubRepoAccessInterface } from '@etherealengine/common/src/dbmodels/GithubRepoAccess'

import { Application } from '../../../declarations'

export default (app: Application) => {
  const sequelizeClient: Sequelize = app.get('sequelizeClient')
  const githubRepoAccess = sequelizeClient.define<Model<GithubRepoAccessInterface>>(
    'github-repo-access',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV1,
        allowNull: false,
        primaryKey: true
      },
      repo: {
        type: DataTypes.STRING,
        allowNull: false
      },
      hasWriteAccess: {
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

  ;(githubRepoAccess as any).associate = (models: any): void => {
    ;(githubRepoAccess as any).belongsTo(models.identity_provider, { required: true, onDelete: 'cascade' })
  }

  return githubRepoAccess
}
