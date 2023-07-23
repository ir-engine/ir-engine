/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/EtherealEngine/etherealengine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Ethereal Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Ethereal Engine team.

All portions of the code written by the Ethereal Engine team are Copyright © 2021-2023 
Ethereal Engine. All Rights Reserved.
*/

import { spawn } from 'child_process'
import { Sequelize } from 'sequelize'

import { isDev } from '@etherealengine/common/src/config'
import appConfig from '@etherealengine/server-core/src/appconfig'

import { Application } from '../declarations'
import { seeder } from './seeder'
import multiLogger from './ServerLogger'

const logger = multiLogger.child({ component: 'server-core:sequelize' })

export default (app: Application): void => {
  try {
    const { forceRefresh } = appConfig.db

    logger.info('Starting app.')

    const sequelize = new Sequelize({
      ...(appConfig.db as any),
      logging: forceRefresh ? logger.info.bind(logger) : false,
      define: {
        freezeTableName: true,
        collate: 'utf8mb4_general_ci'
      }
    })
    const oldSetup = app.setup
    const oldTeardown = app.teardown

    app.set('sequelizeClient', sequelize)

    let promiseResolve, promiseReject
    app.isSetup = new Promise((resolve, reject) => {
      promiseResolve = resolve
      promiseReject = reject
    })

    app.teardown = async function (...args) {
      try {
        await sequelize.close()
        console.log('Sequelize connection closed')
      } catch (err) {
        logger.error('Sequelize teardown error')
        logger.error(err)
        promiseReject()
        throw err
      }
      return oldTeardown.apply(this, args)
    }

    app.setup = async function (...args) {
      try {
        await sequelize.query('SET FOREIGN_KEY_CHECKS = 0')

        const tableCount = await sequelize.query(
          `select table_schema as etherealengine,count(*) as tables from information_schema.tables where table_type = \'BASE TABLE\' and table_schema not in (\'information_schema\', \'sys\', \'performance_schema\', \'mysql\') group by table_schema order by table_schema;`
        )
        const prepareDb = process.env.PREPARE_DATABASE === 'true' || (isDev && tableCount[0] && !tableCount[0][0])
        // Sync to the database
        for (const model of Object.keys(sequelize.models)) {
          const sequelizeModel = sequelize.models[model]
          if (typeof (sequelizeModel as any).associate === 'function') {
            ;(sequelizeModel as any).associate(sequelize.models)
          }
          await sequelizeModel.sync({ force: forceRefresh || appConfig.testEnabled })

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
                  if (!value.references) {
                    if (value.unique)
                      try {
                        await sequelize.getQueryInterface().removeIndex(model, value.fieldName)
                      } catch (err) {}
                    await sequelize.getQueryInterface().changeColumn(model, value.fieldName, value)
                  }
                } catch (err) {
                  logger.error(err)
                }
              }
            }
          }
        }

        if (forceRefresh || appConfig.testEnabled || prepareDb) {
          // We are running our migrations here, so that tables above in db tree are create 1st using sequelize.
          // And then knex migrations can be executed. This is because knex migrations will have foreign key dependency
          // on ta tables that are created using sequelize.
          // TODO: Once sequelize is removed, we should add migration as part of `dev-reinit-db` script in package.json
          const initPromise = new Promise((resolve, reject) => {
            const initProcess = spawn('npm', ['run', 'migrate'])
            initProcess.once('exit', resolve)
            initProcess.once('error', reject)
            initProcess.once('disconnect', resolve)
            initProcess.stdout.on('data', (data) => console.log(data.toString()))
          })
            .then(console.log)
            .catch((err) => {
              logger.error('Knex migration error')
              logger.error(err)
              promiseReject()
              throw err
            })

          await Promise.race([
            initPromise,
            new Promise<void>((resolve) => {
              setTimeout(
                () => {
                  console.log('WARNING: Knex migrations took too long to run!')
                  resolve()
                },
                2 * 60 * 1000
              ) // timeout after 2 minutes
            })
          ])
        }

        try {
          // connect to sequelize
          const sync = await sequelize.sync()
          try {
            // configure seeder and seed
            await seeder(app, forceRefresh || appConfig.testEnabled, prepareDb)
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
