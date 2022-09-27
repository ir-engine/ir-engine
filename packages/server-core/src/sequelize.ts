import { Sequelize } from 'sequelize'

import { isDev } from '@xrengine/common/src/utils/isDev'
import config from '@xrengine/server-core/src/appconfig'

import { Application } from '../declarations'
import { seeder } from './seeder'
import multiLogger from './ServerLogger'

const logger = multiLogger.child({ component: 'server-core:sequelize' })

export default (app: Application): void => {
  try {
    const { forceRefresh } = config.db

    logger.info('Starting app.')

    const sequelize = new Sequelize({
      ...(config.db as any),
      logging: forceRefresh ? logger.info.bind(logger) : false,
      define: {
        freezeTableName: true,
        collate: 'utf8mb4_general_ci'
      }
    })
    const oldSetup = app.setup

    app.set('sequelizeClient', sequelize)

    let promiseResolve, promiseReject
    app.isSetup = new Promise((resolve, reject) => {
      promiseResolve = resolve
      promiseReject = reject
    })

    app.setup = async function (...args: any) {
      try {
        await sequelize.query('SET FOREIGN_KEY_CHECKS = 0')

        const tableCount = await sequelize.query(
          `select table_schema as xrengine,count(*) as tables from information_schema.tables where table_type = \'BASE TABLE\' and table_schema not in (\'information_schema\', \'sys\', \'performance_schema\', \'mysql\') group by table_schema order by table_schema;`
        )
        const prepareDb = process.env.PREPARE_DATABASE === 'true' || (isDev && tableCount[0] && !tableCount[0][0])
        // Sync to the database
        for (const model of Object.keys(sequelize.models)) {
          const sequelizeModel = sequelize.models[model]
          if (typeof (sequelizeModel as any).associate === 'function') {
            ;(sequelizeModel as any).associate(sequelize.models)
          }
          await sequelizeModel.sync({ force: forceRefresh })

          if (prepareDb) {
            const columnResult = await sequelize.query(`DESCRIBE \`${model}\``)
            const columns = columnResult[0]
            const columnKeys = columns.map((column: any) => column.Field)
            for (let item in sequelizeModel.rawAttributes) {
              const value = sequelizeModel.rawAttributes[item] as any
              if (columnKeys.indexOf(value.fieldName) < 0) {
                if (value.oldColumn && columnKeys.indexOf(value.oldColumn) >= 0)
                  await sequelize.getQueryInterface().renameColumn(model, value.oldColumn, value.fieldName)
                else await sequelize.getQueryInterface().addColumn(model, value.fieldName, value)
              }
              if (columnKeys.indexOf(value.fieldName) >= 0 && !value.primaryKey) {
                try {
                  if (!value.references) await sequelize.getQueryInterface().changeColumn(model, value.fieldName, value)
                } catch (err) {
                  logger.error(err)
                }
              }
            }
          }
        }

        try {
          // connect to sequelize
          const sync = await sequelize.sync()
          try {
            // configure seeder and seed
            await seeder(app, forceRefresh, prepareDb)
          } catch (err) {
            logger.error('Feathers seeding error')
            logger.error(err)
            promiseReject()
            throw err
          }

          app.set('sequelizeSync', sync)
          await sequelize.query('SET FOREIGN_KEY_CHECKS = 1')
          logger.info('Server Ready')
        } catch (err) {
          logger.error('Sequelize sync error')
          logger.error(err)
          promiseReject()
          throw err
        }

        promiseResolve()
        if ((prepareDb || forceRefresh) && (isDev || process.env.EXIT_ON_DB_INIT === 'true')) process.exit(0)
      } catch (err) {
        logger.error('Sequelize setup error')
        logger.error(err)
        promiseReject()
        throw err
      }

      return oldSetup.apply(this, args)
    }
  } catch (err) {
    logger.error('Error in app/sequelize.ts')
    logger.error(err)
  }
}
