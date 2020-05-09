import { Sequelize } from 'sequelize'
import { Application } from './declarations'
// @ts-ignore
import seederConfig from './seeder-config'
// @ts-ignore
import seeder from 'feathers-seeder'

export default (app: Application): void => {
  let connectionString
  if (process.env.KUBERNETES === 'true') {
    const dbUser = process.env.MYSQL_USER ?? ''
    const dbPass = process.env.MYSQL_PASSWORD ?? ''
    const dbHost = process.env.MYSQL_HOST ?? ''
    const dbName = process.env.MYSQL_DATABASE ?? ''
    connectionString = 'mysql://' + dbUser + ':' + dbPass + '@' + dbHost + ':3306/' + dbName
  } else {
    connectionString = app.get('mysql')
  }
  const sequelize = new Sequelize(connectionString, {
    dialect: 'mysql',
    logging: (process.env.FORCE_DB_REFRESH === 'true'),
    define: {
      freezeTableName: true
    }
  })
  const oldSetup = app.setup

  app.set('sequelizeClient', sequelize)

  app.setup = function (...args: any) {
    // Sync to the database
    app.set('sequelizeSync', sequelize.sync({ force: (process.env.FORCE_DB_REFRESH === 'true') }).then(() => {
      // @ts-ignore
      app.configure(seeder(seederConfig)).seed()
    }).catch(error => {
      console.log(error)
    })
    )
    return oldSetup.apply(this, args)
  }
}
