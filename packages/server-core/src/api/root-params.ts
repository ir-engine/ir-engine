import { UserType } from '@etherealengine/engine/src/schemas/user/user.schema'
import { AdapterQuery } from '@feathersjs/adapter-commons'
import { Params } from '@feathersjs/feathers'
import { KnexAdapterParams } from '@feathersjs/knex'

export interface RootParams<Q = AdapterQuery> extends KnexAdapterParams<Q> {
  user?: UserType
  isInternal?: boolean
}

export interface UserParams extends Params {
  user?: UserType
  paginate?: false
  isInternal?: boolean
  sequelize?: any
}
