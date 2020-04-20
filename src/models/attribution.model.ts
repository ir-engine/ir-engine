import { Sequelize, DataTypes } from 'sequelize'
import { Application } from '../declarations'

export default function (app: Application): any {
  const sequelizeClient: Sequelize = app.get('sequelizeClient')
  const attribution = sequelizeClient.define('attribution', {
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    creator: {
      type: DataTypes.STRING,
      allowNull: false
    },
    url: {
      type: DataTypes.STRING,
      allowNull: false
    },
    type: {
      type: DataTypes.STRING, // TODO: ASSOCIATE AND CHANGE TYPE
      allowNull: false
    },
    license: {
      type: DataTypes.STRING, // TODO: ASSOCIATE AND CHANGE TYPE
      allowNull: false
    }
  }, {
    hooks: {
      beforeCount (options: any) {
        options.raw = true
      }
    }
  });

  // eslint-disable-next-line no-unused-vars
  (attribution as any).associate = function (models: any) {
  }

  return attribution
}
