import { SequelizeServiceOptions, Service } from 'feathers-sequelize'

import { UserRelationshipTypeInterface } from '@xrengine/common/src/dbmodels/UserRelationshipType'

import { Application } from '../../../declarations'

export type UserRelationshipTypeDataType = UserRelationshipType
/**
 * A class for User Relationship Type service
 */
export class UserRelationshipType<T = UserRelationshipTypeDataType> extends Service<T> {
  public docs: any
  constructor(options: Partial<SequelizeServiceOptions>, app: Application) {
    super(options)
  }
}
