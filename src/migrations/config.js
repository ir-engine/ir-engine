const config = require('config')
const env = process.env.NODE_ENV || 'development'

let dbconfig
if (process.env.KUBERNETES === 'true') {
  dbconfig = {
    username: process.env.MYSQL_USER || '',
    password: process.env.MYSQL_PASSWORD || '',
    database: process.env.MYSQL_DATABASE || '',
    host: process.env.MYSQL_HOST || '',
    dialect: 'mysql'
  }
} else {
  dbconfig = {
    url: config.get('mysql')
  }
}

module.exports = {
  [env]: {
    ...dbconfig,
    migrationStorageTableName: '_migrations'
  }
}
