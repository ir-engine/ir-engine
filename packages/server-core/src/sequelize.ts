import config from '@xrengine/server-core/src/appconfig'
import seeder from '@xrengine/server-core/src/util/seeder'
import { Sequelize } from 'sequelize'
import { Application } from '../declarations'
import seederConfig from './seeder-config'

export default (app: Application): void => {
  try {
    const { forceRefresh } = config.db

    console.log('Starting app')

    const sequelize = new Sequelize({
      ...(config.db as any),
      logging: forceRefresh ? console.log : false,
      define: {
        freezeTableName: true
      }
    })
    const oldSetup = app.setup

    app.set('sequelizeClient', sequelize)

    let promiseResolve, promiseReject
    app.isSetup = new Promise((resolve, reject) => {
      promiseResolve = resolve
      promiseReject = reject
    })

    // @ts-ignore
    app.setup = async function (...args: any) {
      try {
        await sequelize.query('SET FOREIGN_KEY_CHECKS = 0')
        const [results] = await sequelize.query("SHOW TABLES LIKE 'user';")
        if (results.length === 0) {
          throw new Error('\n\nUser table does not exist - make sure you have initialised the database\n\n')
        }
        // Sync to the database
        for (const model of Object.keys(sequelize.models)) {
          if (forceRefresh) console.log('creating associations for =>', sequelize.models[model])
          if (typeof (sequelize.models[model] as any).associate === 'function') {
            ;(sequelize.models[model] as any).associate(sequelize.models)
          }
        }

        try {
          // connect to sequelize
          const sync = await sequelize.sync({ force: forceRefresh })

          // configure seeder and seed
          try {
            if (forceRefresh) {
              await app.configure(seeder(seederConfig)).seed()
            }
          } catch (err) {
            console.log('Feathers seeding error')
            console.log(err)
            promiseReject()
            throw err
          }

          app.set('sequelizeSync', sync)
          await sequelize.query('SET FOREIGN_KEY_CHECKS = 1')
          console.log('Server Ready')
        } catch (err) {
          console.log('Sequelize sync error')
          console.log(err)
          promiseReject()
          throw err
        }

        promiseResolve()
        if (forceRefresh) process.exit(0)
      } catch (err) {
        console.log('Sequelize setup error')
        console.log(err)
        promiseReject()
        throw err
      }

      return oldSetup.apply(this, args)
    }
  } catch (err) {
    console.log('Error in app/sequelize.ts')
    console.log(err)
  }
}
