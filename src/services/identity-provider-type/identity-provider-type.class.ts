import { Service, SequelizeServiceOptions } from 'feathers-sequelize'
import { Application } from '../../declarations'

<<<<<<< HEAD:src/services/user-relationship-type/user-relationship-type.class.ts
export class UserRelationshipType extends Service {
=======
export class IdentityProviderType extends Service {
>>>>>>> dev:src/services/identity-provider-type/identity-provider-type.class.ts
  constructor (options: Partial<SequelizeServiceOptions>, app: Application) {
    super(options)
  }
}
