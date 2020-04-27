import { Service, SequelizeServiceOptions } from 'feathers-sequelize'
import { Application } from '../../declarations'
import { Sequelize } from 'sequelize'
import crypto from 'crypto'

export class IdentityProvider extends Service {
  public app: Application

  constructor (options: Partial<SequelizeServiceOptions>, app: Application) {
    super(options)
    this.app = app
  }

  async create (data: any, params: any): Promise<any> {
    const {
      token,
      githubId,
      googleId,
      facebookId,
      accountType,
      password
    } = data

    let identityProvider: any

    let hashData = ''
    switch (accountType) {
      case 'email':
        hashData = token
        identityProvider = {
          token,
          accountType
        }
        break
      case 'sms':
        hashData = token
        identityProvider = {
          token,
          accountType
        }
        break
      case 'password':
        hashData = token
        identityProvider = {
          token,
          password,
          accountType
        }
        break
      case 'github':
        hashData = githubId
        identityProvider = {
          token: githubId,
          accountType
        }
        break
      case 'facebook':
        hashData = facebookId
        identityProvider = {
          token: facebookId,
          accountType
        }
        break
      case 'google':
        hashData = googleId
        identityProvider = {
          token: googleId,
          accountType
        }
        break
      case 'auth0':
        break
    }
    const userId = crypto.createHash('md5').update(hashData).digest('hex')
    const sequelizeClient: Sequelize = this.app.get('sequelizeClient')
    const userService = this.app.service('user')
    const User = sequelizeClient.model('user')

    const foundUser = ((await userService.find({
      query: {
        id: userId
      }
    })) as any).data

    if (foundUser.length > 0) {
      return await super.create({
        ...data,
        ...identityProvider,
        userId
      }, params)
    }

    // create with user association
    params.sequelize = {
      include: [User]
    }

    const result = await super.create({
      ...data,
      ...identityProvider,
      userId,
      user: {
        id: userId
      }
    }, params)

    return result
  }
}
