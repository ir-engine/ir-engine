import { db } from '@xrengine/server-core/src/appconfig'
const env = process.env.NODE_ENV || 'development'

module.exports = {
  [env]: {
    ...db,
    migrationStorageTableName: '_migrations'
  }
}
