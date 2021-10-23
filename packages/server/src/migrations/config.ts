import { db } from '@xrengine/server-core/src/appconfig'
const env = process.env.APP_ENV || 'development'

module.exports = {
  [env]: {
    ...db,
    migrationStorageTableName: '_migrations'
  }
}
