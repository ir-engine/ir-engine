import { Id, NullableId, Paginated, Params, ServiceMethods } from '@feathersjs/feathers'
import { Application } from '../../declarations'
import {BadRequest} from '@feathersjs/errors'
import _ from 'lodash'
import Sequelize, { Op } from 'sequelize'

interface Data {}

interface ServiceOptions {}

export class InstanceProvision implements ServiceMethods<Data> {
  app: Application;
  options: ServiceOptions;

  constructor (options: ServiceOptions = {}, app: Application) {
    this.options = options;
    this.app = app;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async find (params?: Params): Promise<any> {
    try {
      if (process.env.KUBERNETES !== 'true') {
        return {
          ipAddress: '127.0.0.1',
          port: '3030'
        }
      }
      const instanceModel = this.app.service('instance').Model
      const locationId = params.query.locationId
      if (locationId == null) {
        throw new BadRequest('Missing location ID')
      }
      const location = await this.app.service('location').get(locationId)
      if (location == null) {
        throw new BadRequest('Invalid location ID')
      }
      const availableLocationInstances = await this.app.service('instance').Model.findAll({
        where: {
          locationId: location.id
        },
        include: [
          {
            model: this.app.service('location').Model,
            where: {
              maxUsersPerInstance: {
                [Op.gt]: Sequelize.col('instance.currentUsers')
              }
            }
          }
        ]
      })
      if (availableLocationInstances.length === 0) {
        const serverResult = await (this.app as any).k8Client.get('gameservers')
        const readyServers = _.filter(serverResult.items, (server: any) => server.status.state === 'Ready')
        const server = readyServers[Math.floor(Math.random() * readyServers.length)]
        return {
          ipAddress: server.status.address,
          port: server.status.ports[0].port
        }
      } else {
        const instanceUserSort = _.sortBy(availableLocationInstances, (instance: typeof instanceModel) => instance.currentUsers)
        const ipAddressSplit = instanceUserSort[0].ipAddress.split(':')
        return {
          ipAddress: ipAddressSplit[0],
          port: ipAddressSplit[1]
        }
      }
    } catch (err) {
      console.log(err)
      throw err
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async get (id: Id, params?: Params): Promise<Data> {
    return {
      id, text: `A new message with ID: ${id}!`
    };
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async create (data: Data, params?: Params): Promise<Data> {
    if (Array.isArray(data)) {
      return Promise.all(data.map(current => this.create(current, params)));
    }

    return data;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async update (id: NullableId, data: Data, params?: Params): Promise<Data> {
    return data;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async patch (id: NullableId, data: Data, params?: Params): Promise<Data> {
    return data;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async remove (id: NullableId, params?: Params): Promise<Data> {
    return { id };
  }
}
