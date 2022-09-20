import { DataTypes, Model, Sequelize } from 'sequelize'

import { VerificationEventInterface } from '@xrengine/common/src/dbmodels/VerificationEvent'

import { Application } from '../../../declarations'

/**
 * Verification Event model
 */
export default (app: Application) => {
  const sequelizeClient: Sequelize = app.get('sequelizeClient')
  const VerificationEvent = sequelizeClient.define<Model<VerificationEventInterface>>(
    'verification-event',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV1,
        allowNull: false,
        primaryKey: true
      },
      userId: {
        type: DataTypes.STRING,
        defaultValue: (): string => '',
        allowNull: false
      },
      expiresAt: {
        type: DataTypes.DATE,
        defaultValue: Date.now(),
        allowNull: false
      },
      log: {
        type: DataTypes.STRING,
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

  ;(VerificationEvent as any).associate = (models: any): void => {
    ;(VerificationEvent as any).belongsTo(models.user)
  }

  return VerificationEvent
}
