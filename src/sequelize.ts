import { Sequelize } from 'sequelize'
import { Application } from './declarations'

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
    logging: false,
    define: {
      freezeTableName: true
    }
  })
  const oldSetup = app.setup

  app.set('sequelizeClient', sequelize)

  app.setup = function (...args: any) {
    // Set up data relationships
    const models = sequelize.models

    Object.keys(models).forEach((name) => {
      if ('associate' in models[name]) {
        (models[name] as any).associate(models);
      }
    })

    app.set('sequelizeSync', sequelize.sync()) // Sync to the database

    return oldSetup.apply(this, args)
  }
}
