import { Service, SequelizeServiceOptions } from 'feathers-sequelize'
import { Application } from '../../declarations'
import crypto from 'crypto'

export class Users extends Service {
  constructor (options: Partial<SequelizeServiceOptions>, app: Application) {
    super(options)
    if (app)console.log(app)
  }

  create (data: any, params: any) {
    const { email, password, githubId } = data

    const userId = crypto.createHash('md5').update(email != null ? email.toLowerCase() : githubId).digest('hex')

    const userData = {
      email, password, githubId, userId
    }

    return await super.create(userData, params)
  }
}
