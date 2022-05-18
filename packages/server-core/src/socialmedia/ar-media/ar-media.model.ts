/**
 * @author Tanya Vykliuk <tanya.vykliuk@gmail.com>
 */
// See http://docs.sequelizejs.com/en/latest/docs/models-definition/
// for more of what you can do here.
import { Sequelize, DataTypes, Model } from 'sequelize'
import { Application } from '../../../declarations'
import { HookReturn } from 'sequelize/types/lib/hooks'

export default function (app: Application): typeof Model {
  const sequelizeClient: Sequelize = app.get('sequelizeClient')
  const ArMedia = sequelizeClient.define(
    'ar_media',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV1,
        allowNull: false,
        primaryKey: true
      },
      type: {
        type: DataTypes.STRING,
        allowNull: false,
        values: ['clip', 'background']
      },
      title: {
        type: DataTypes.STRING,
        allowNull: false
      }
    },
    {
      hooks: {
        beforeCount(options: any): HookReturn {
          options.raw = true
        }
      }
    }
  )

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  ;(ArMedia as any).associate = (models: any): void => {
    // Define associations here
    // See http://docs.sequelizejs.com/en/latest/docs/associations/
    // (ArMedia as any).belongsTo(models.collection, { foreignKey: 'collectionId' });
    ;(ArMedia as any).belongsTo(models.static_resource, { as: 'manifest', required: false, constraints: false })
    ;(ArMedia as any).belongsTo(models.static_resource, { as: 'audio', required: true, constraints: false })
    ;(ArMedia as any).belongsTo(models.static_resource, { as: 'dracosis', required: true, constraints: false })
    ;(ArMedia as any).belongsTo(models.static_resource, { as: 'preview', required: true, constraints: false })
  }

  return ArMedia
}
