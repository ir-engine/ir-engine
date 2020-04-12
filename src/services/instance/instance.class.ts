import { Service, SequelizeServiceOptions } from 'feathers-sequelize'
import { Application } from '../../declarations'

export class LocationInstances extends Service {
  app: Application

  constructor (options: Partial<SequelizeServiceOptions>, app: Application) {
    super(options)
    this.app = app
  }

  async create (data: any, params: any): Promise<any> {
    const { location, count } = data
    this.app.service('location').filterQuery({ paginate: false, query: { location } }).then((locations: any) => {
      if (locations.length === 0) return false
    })

    const userData = { location }

    return await this.createLocation(userData, params, count)
  }

  async createLocation (
    userData: { location: Location },
    params: any,
    count: number
  ): Promise<boolean> {
    console.log(('').concat('Creating instance #', count.toString(), ' at location ', userData.location.toString()))

    await new Promise((resolve) =>
      setTimeout(() => resolve(super.create(userData, params)), 1000)
    )

    return count > 0
      ? await this.createLocation(userData, params, count - 1)
      : true
  }
}
