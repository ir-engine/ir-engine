import { Sequelize, DataTypes } from 'sequelize'
import { Application } from '../../../declarations'

export default (app: Application): any => {
  const sequelizeClient: Sequelize = app.get('sequelizeClient')
  const tag = sequelizeClient.define(
    'tag',
    {
      tag: {
        type: DataTypes.STRING,
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

  ;(tag as any).associate = (models: any): void => {
    ;(tag as any).belongsToMany(models.collection, { through: 'collection_tag' })
  }

  return tag
}
