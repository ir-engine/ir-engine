/**
 * @author Tanya Vykliuk <tanya.vykliuk@gmail.com>
 */
import { DataTypes, Sequelize } from 'sequelize'
import { Application } from '../../../declarations'

/**
 * This model contain creator information - ARCAPP
 */
export default (app: Application) => {
  const sequelizeClient: Sequelize = app.get('sequelizeClient')
  const Creator = sequelizeClient.define(
    'creator',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV1,
        allowNull: false,
        primaryKey: true
      },
      verified: {
        type: DataTypes.BOOLEAN,
        defaultValue: (): boolean => false
      },
      isBlocked: {
        type: DataTypes.BOOLEAN,
        defaultValue: (): boolean => false
      },
      steps: {
        type: DataTypes.BOOLEAN,
        defaultValue: (): boolean => false
      },
      terms: {
        type: DataTypes.BOOLEAN,
        defaultValue: (): boolean => false
      },
      policy: {
        type: DataTypes.BOOLEAN,
        defaultValue: (): boolean => false
      },
      name: {
        type: DataTypes.STRING,
        defaultValue: (): string => '',
        allowNull: true
      },
      username: {
        type: DataTypes.STRING,
        defaultValue: (): string => '',
        allowNull: false,
        unique: true
      },
      email: {
        type: DataTypes.STRING,
        defaultValue: (): string => '',
        allowNull: true
      },
      link: {
        type: DataTypes.STRING,
        defaultValue: (): string => '',
        allowNull: true
      },
      bio: {
        type: DataTypes.STRING,
        defaultValue: (): string => '',
        allowNull: true
      },
      twitter: {
        type: DataTypes.STRING,
        defaultValue: (): string => '',
        allowNull: true
      },
      tiktok: {
        type: DataTypes.STRING,
        defaultValue: (): string => '',
        allowNull: true
      },
      snap: {
        type: DataTypes.STRING,
        defaultValue: (): string => '',
        allowNull: true
      },
      instagram: {
        type: DataTypes.STRING,
        defaultValue: (): string => '',
        allowNull: true
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

  ;(Creator as any).associate = (models: any): void => {
    ;(Creator as any).belongsTo(models.user, { as: 'user', required: true, constraints: false })
    ;(Creator as any).hasMany(models.feed, { foreignKey: 'creatorId' })
    ;(Creator as any).hasMany(models.feed_fires, { foreignKey: 'creatorId' })
    ;(Creator as any).hasMany(models.feed_bookmark, { foreignKey: 'creatorId' })
    ;(Creator as any).hasMany(models.comments, { foreignKey: 'creatorId' })
    ;(Creator as any).hasMany(models.comments_fires, { foreignKey: 'creatorId' })
    ;(Creator as any).belongsTo(models.static_resource, { as: 'avatar', required: false, constraints: false })
  }

  return Creator
}
