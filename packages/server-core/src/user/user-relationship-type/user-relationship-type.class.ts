import { Service, SequelizeServiceOptions } from 'feathers-sequelize'
import { Application } from '../../../declarations'
import { UserRelationshipTypeInterface } from '@xrengine/common/src/dbmodels/UserRelationshipType'

export type UserRelationshipTypeDataType = UserRelationshipType
/**
 * A class for User Relationship Type service
 *
 * @author Vyacheslav Solovjov
 */
export class UserRelationshipType<T = UserRelationshipTypeDataType> extends Service<T> {
  public docs: any
  constructor(options: Partial<SequelizeServiceOptions>, app: Application) {
    super(options)
  }
}
