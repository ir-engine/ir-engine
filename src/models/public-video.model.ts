// See http://docs.sequelizejs.com/en/latest/docs/models-definition/
// for more of what you can do here.
import { Sequelize, DataTypes } from 'sequelize'
import { Application } from '../declarations'

export default function (app: Application): any {
  const sequelizeClient: Sequelize = app.get('sequelizeClient')
  const publicVideo = sequelizeClient.define('public_video', {
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
  });

  // eslint-disable-next-line no-unused-vars
  (publicVideo as any).associate = function (models: any) {
    // Define associations here
    // See http://docs.sequelizejs.com/en/latest/docs/associations/
  }

  return publicVideo
}
