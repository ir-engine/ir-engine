import { DataTypes, Model, Sequelize } from 'sequelize'

import { AuthenticationInterface } from '@xrengine/common/src/dbmodels/Authentication'

import { Application } from '../../../declarations'

export default (app: Application) => {
  const sequelizeClient: Sequelize = app.get('sequelizeClient')
  const Authentication = sequelizeClient.define<Model<AuthenticationInterface>>('authentication', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV1,
      allowNull: false,
      primaryKey: true
    },
    service: {
      type: DataTypes.STRING,
      allowNull: true
    },
    entity: {
      type: DataTypes.STRING,
      allowNull: true
    },
    secret: {
      type: DataTypes.STRING,
      allowNull: true
    },
    authStrategies: {
      type: DataTypes.JSON,
      allowNull: true
    },
    local: {
      type: DataTypes.JSON,
      allowNull: true
    },
    jwtOptions: {
      type: DataTypes.JSON,
      allowNull: true
    },
    bearerToken: {
      type: DataTypes.JSON,
      allowNull: true
    },
    callback: {
      type: DataTypes.JSON,
      allowNull: true
    },
    oauth: {
      type: DataTypes.JSON,
      allowNull: true
    }
  })
  return Authentication
}
