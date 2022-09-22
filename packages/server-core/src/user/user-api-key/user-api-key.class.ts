import { NullableId } from '@feathersjs/feathers'
import { SequelizeServiceOptions, Service } from 'feathers-sequelize'
import { v1 } from 'uuid'

import { UserApiKeyInterface } from '@xrengine/common/src/dbmodels/UserApiKey'
import { UserInterface } from '@xrengine/common/src/interfaces/User'

import { Application } from '../../../declarations'
import { UserParams } from '../user/user.class'

export type UserApiKeyDataType = UserApiKeyInterface & { userId: string }
/**
 * This class used to find user-api-keys
 * and returns founded user-api-keys
 */
export class UserApiKey<T = UserApiKeyDataType> extends Service<T> {
  app: Application
  docs: any

  constructor(options: Partial<SequelizeServiceOptions>, app: Application) {
    super(options)
    this.app = app
  }

  async patch(id: NullableId, data: any, params: UserParams = {}): Promise<T | T[]> {
    const loggedInUser = params.user as UserInterface
    if (
      loggedInUser.scopes &&
      loggedInUser.scopes.find((scope) => scope.type === 'admin:admin') &&
      id != null &&
      params
    )
      return super.patch(id, { ...data })
    const userApiKey = await this.app.service('user-api-key').Model.findOne({
      where: {
        userId: loggedInUser.id
      }
    })
    let returned
    if (userApiKey) {
      const patchData: any = { token: v1() }
      returned = await super.patch(userApiKey.id, { ...patchData })
    } else {
      const patchData: any = { userId: loggedInUser.id }
      returned = await super.create({ ...patchData })
    }
    return returned
  }
}
