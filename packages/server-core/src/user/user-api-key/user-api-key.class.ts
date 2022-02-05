import { Service, SequelizeServiceOptions } from 'feathers-sequelize'
import { Application } from '../../../declarations'
import { Params } from '@feathersjs/feathers'
import { extractLoggedInUserFromParams } from '../auth-management/auth-management.utils'
import { v1 } from 'uuid'

/**
 * This class used to find user-api-keys
 * and returns founded user-api-keys
 */
export class UserApiKey extends Service {
  app: Application
  docs: any

  constructor(options: Partial<SequelizeServiceOptions>, app: Application) {
    super(options)
    this.app = app
  }

  async patch(id: string | null, data: any, params: Params) {
    const loggedInUser = await extractLoggedInUserFromParams(params)
    if (loggedInUser.userRole === 'admin' && id != null) return super.patch(id, params)
    const userApiKey = await this.app.service('user-api-key').Model.findOne({
      where: {
        userId: loggedInUser.id
      }
    })
    let returned
    if (userApiKey)
      returned = await super.patch(userApiKey.id, {
        token: v1()
      })
    else
      returned = await super.create({
        userId: loggedInUser.id
      })

    return returned
  }
}
