import { DataTypes, Model, Sequelize } from 'sequelize'

import { ScopeTypeInterface } from '@xrengine/common/src/dbmodels/ScopeType'

import { Application } from '../../../declarations'

export default (app: Application) => {
  const sequelizeClient: Sequelize = app.get('sequelizeClient')
  const ScopeType = sequelizeClient.define<Model<ScopeTypeInterface>>(
    'scopeType',
    {
      type: {
        type: DataTypes.STRING,
        allowNull: false,
        primaryKey: true,
        unique: true
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
  ;(ScopeType as any).associate = (models: any): void => {
    ;(ScopeType as any).hasMany(models.scope, { foreignKey: 'type' })
  }

  return ScopeType
}
