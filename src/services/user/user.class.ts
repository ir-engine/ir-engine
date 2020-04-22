import { Service, SequelizeServiceOptions } from 'feathers-sequelize'
import { Application } from '../../declarations'
import crypto from 'crypto'

export class User extends Service {
  constructor (options: Partial<SequelizeServiceOptions>, app: Application) {
    super(options)
  }

  async create (data: any, params: any): Promise<any> {
    const {
      email,
      password,
      githubId,
      googleId,
      facebookId,
      mobile
    } = data

    let hashData = ''
    if (email) {
      hashData = email
    } else if (githubId) {
      hashData = githubId.toString()
    } else if (googleId) {
      hashData = googleId.toString()
    } else if (facebookId) {
      hashData = facebookId.toString()
    } else if (mobile) {
      hashData = mobile
    }
    const userId = crypto.createHash('md5').update(hashData).digest('hex')

    const userData = {
      ...data,
      email,
      password,
      userId
    }

    return await super.create(userData, params)
  }
}
