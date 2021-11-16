// See http://docs.sequelizejs.com/en/latest/docs/models-definition/
// for more of what you can do here.

import { DataTypes, Sequelize } from 'sequelize'
import { Application } from '../../../declarations'

export default (app: Application) => {
  const sequelizeClient: Sequelize = app.get('sequelizeClient')
  const Team = sequelizeClient.define(
    'team',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV1,
        allowNull: false,
        primaryKey: true
      },
      title: {
        type: DataTypes.STRING,
        allowNull: false
      },
      games_played: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      wins: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      losses: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      won_lost_percentage: {
        type: DataTypes.FLOAT,
        allowNull: false,
        defaultValue: 0
      },
      minutes_per_game: {
        type: DataTypes.FLOAT,
        allowNull: false,
        defaultValue: 0
      },
      points: {
        type: DataTypes.FLOAT,
        allowNull: false,
        defaultValue: 0
      },
      field_goals_made: {
        type: DataTypes.FLOAT,
        allowNull: false,
        defaultValue: 0
      },
      field_goals_attempts: {
        type: DataTypes.FLOAT,
        allowNull: false,
        defaultValue: 0
      },
      field_goals_percentage: {
        type: DataTypes.FLOAT,
        allowNull: false,
        defaultValue: 0
      },
      three_pointers_made: {
        type: DataTypes.FLOAT,
        allowNull: false,
        defaultValue: 0
      },
      three_pointers_attempts: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      three_pointers_percentage: {
        type: DataTypes.FLOAT,
        allowNull: false,
        defaultValue: 0
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

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  ;(Team as any).associate = (models: any): void => {
    // Define associations here
    // See http://docs.sequelizejs.com/en/latest/docs/associations/
    ;(Team as any).belongsTo(models.profile, { foreignKey: 'profileId', allowNull: false })
  }

  return Team
}
