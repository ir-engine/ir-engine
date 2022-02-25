import { Sequelize } from 'sequelize'

import { isDev } from '@xrengine/common/src/utils/isDev'
import config from '@xrengine/server-core/src/appconfig'
import seeder from '@xrengine/server-core/src/util/seeder'

import { Application } from '../declarations'
import { copyDefaultProject, uploadLocalProjectToProvider } from './projects/project/project.class'
import seederConfig from './seeder-config'

const settingsServiceNames = [
  'analytics-setting',
  'authentication-setting',
  'aws-setting',
  'chargebee-setting',
  'client-setting',
  'email-setting',
  'game-server-setting',
  'redis-setting',
  'server-setting'
]

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
                  console.error(err)
                }
              }
            }
          }
        }

        try {
          // connect to sequelize
          const sync = await sequelize.sync()

          if (forceRefresh || prepareDb)
            for (let config of seederConfig) {
              if (config.path) {
                const templates = config.templates
                const service = app.service(config.path)
                if (templates)
                  for (let template of templates) {
                    let isSeeded
                    if (template.id) {
                      try {
                        await service.get(template.id)
                        isSeeded = true
                      } catch (err) {
                        await service.find()
                        isSeeded = false
                      }
                    } else if (settingsServiceNames.indexOf(config.path) > 0) {
                      const result = await service.find()
                      isSeeded = result.total > 0
                    } else {
                      const searchTemplate = {}
                      for (let key of Object.keys(template))
                        if (typeof template[key] !== 'object') searchTemplate[key] = template[key]
                      const result = await service.find({
                        query: searchTemplate
                      })
                      isSeeded = result.total > 0
                    }
                    if (!isSeeded) await service.create(template)
                  }
              }
            }
          // configure seeder and seed
          try {
            if (forceRefresh) {
              copyDefaultProject()
              await app.service('project')._seedProject('default-project')
              await uploadLocalProjectToProvider('default-project')
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
        if ((prepareDb || forceRefresh) && (isDev || process.env.EXIT_ON_DB_INIT === 'true')) process.exit(0)
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
