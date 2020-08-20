import { Sequelize } from 'sequelize'
import { Application } from '../declarations'
import seederConfig from './seeder-config'
import seeder from 'feathers-seeder'
import config from '../config'
import { setTimeout } from 'timers'

export default (app: Application): void => {
  const { forceRefresh } = config.db
  const { performDryRun } = config.server

  const sequelize = new Sequelize({
    ...config.db,
    logging: forceRefresh ? console.log : false,
    define: {
      freezeTableName: true
    }
  })
  const oldSetup = app.setup

  app.set('sequelizeClient', sequelize)

  app.setup = function (...args: any) {
    // Sync to the database
    app.set('sequelizeSync',
      sequelize.sync({ force: forceRefresh })
        .then(() => {
                    app.configure(seeder(seederConfig)).seed().catch(console.error)
          if (performDryRun) {
            setTimeout(() => process.exit(0), 5000)
          }
        })
        .catch(console.error)
    )
    return oldSetup.apply(this, args)
  }
}
