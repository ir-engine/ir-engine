import { Sequelize, DataTypes } from 'sequelize'
import { Application } from '../declarations'

export default (app: Application): any => {
  const sequelizeClient: Sequelize = app.get('sequelizeClient')
  const publicVideo = sequelizeClient.define('public_video', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV1,
      allowNull: false,
      primaryKey: true
    },
    title: DataTypes.STRING,
    original_title: DataTypes.STRING,
    description: DataTypes.STRING(1000),
    link: {
      unique: true,
      type: DataTypes.STRING
    },
    thumbnail_url: DataTypes.STRING,
    production_credit: DataTypes.STRING,
    rating: DataTypes.STRING,
    categories: DataTypes.STRING,
    runtime: DataTypes.STRING,
    tags: DataTypes.STRING
  }, {
    hooks: {
      beforeCount (options: any) {
        options.raw = true
      }
    }
  })

  return publicVideo
}
