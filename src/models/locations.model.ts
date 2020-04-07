// See http://docs.sequelizejs.com/en/latest/docs/models-definition/
// for more of what you can do here.
import { Sequelize, DataTypes } from 'sequelize'
import { Application } from '../declarations'

export default function (app: Application): any {
  const sequelizeClient: Sequelize = app.get('sequelizeClient')
  const locations = sequelizeClient.define('locations', {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    maxUsersPerInstance: {
      type: DataTypes.NUMBER
    },
    access: {
      type: DataTypes.BOOLEAN
    }
  }, {
    hooks: {
      beforeCount (options: any) {
        options.raw = true
      }
    }
  });

  // eslint-disable-next-line no-unused-vars
  (locations as any).associate = function (models: any) {
    // Define associations here
    // See http://docs.sequelizejs.com/en/latest/docs/associations/
  }

  return locations
}
