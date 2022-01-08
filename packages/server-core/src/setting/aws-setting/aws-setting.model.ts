import { DataTypes, Sequelize } from 'sequelize'

import { Application } from '../../../declarations'

export default (app: Application) => {
  const sequelizeClient: Sequelize = app.get('sequelizeClient')
  const Aws = sequelizeClient.define('Aws', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV1,
      allowNull: false,
      primaryKey: true
    },
    keys: {
      type: DataTypes.JSON,
      allowNull: true
    },
    route53: {
      type: DataTypes.JSON,
      allowNull: true
    },
    s3: {
      type: DataTypes.JSON,
      allowNull: true
    },
    cloudfront: {
      type: DataTypes.JSON,
      allowNull: true
    },
    sms: {
      type: DataTypes.JSON,
      allowNull: true
    }
  })
  return Aws
}
