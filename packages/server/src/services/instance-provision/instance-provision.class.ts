import { Id, NullableId, Paginated, Params, ServiceMethods } from '@feathersjs/feathers'
import { Application } from '../../declarations'
import {BadRequest} from '@feathersjs/errors'
import _ from 'lodash'
import Sequelize, { Op } from 'sequelize'
import { networkInterfaces } from 'os'

interface Data {}

interface ServiceOptions {}

export class InstanceProvision implements ServiceMethods<Data> {
  app: Application;
  options: ServiceOptions;

  constructor (options: ServiceOptions = {}, app: Application) {
    this.options = options;
    this.app = app;
  }

  async getLocalServer() {
    const nets = networkInterfaces();
    const results = Object.create(null); // or just '{}', an empty object
    for (const name of Object.keys(nets)) {
      for (const net of nets[name]) {
        // skip over non-ipv4 and internal (i.e. 127.0.0.1) addresses
        if (net.family === 'IPv4' && !net.internal) {
          if (!results[name]) {
            results[name] = [];
          }

          results[name].push(net.address);
        }
      }
    }
    console.log('Non-internal local ports:')
    console.log(results)
    return {
      ipAddress: results.en0 ? results.en0[0] : results.eno1 ? results.eno1[0] : '127.0.0.1',
      port: '3030'
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async find (params?: Params): Promise<any> {
    try {
      let userId
      const token = params.query.token;
      if (token != null) {
        const authResult = await this.app.service('authentication').strategies.jwt.authenticate({accessToken: token}, {})
        const identityProvider = authResult['identity-provider']
        if (identityProvider != null) {
          userId = identityProvider.userId
        }
        else {
          throw new BadRequest('Invalid user credentials')
        }
      }
      const user = await this.app.service('user').get(userId);
      if (user.partyId) {
        console.log('Joining party\'s instance')
        const partyOwnerResult = await this.app.service('party-user').find({
          query: {
            partyId: user.partyId,
            isOwner: true
          }
        });
        const partyOwner = (partyOwnerResult as any).data[0]
        console.log('PartyOwner:')
        console.log(partyOwner);
        console.log(partyOwner.user)
        if (process.env.KUBERNETES !== 'true') {
          return this.getLocalServer();
        }
        if (partyOwner.userId !== userId && partyOwner.user.instanceId) {
          const partyInstance = await this.app.service('instance').get(partyOwner.user.instanceId);
          const addressSplit = partyInstance.ipAddress.split(':');
          console.log('addressSplit:');
          console.log(addressSplit);
          return {
            ipAddress: addressSplit[0],
            port: addressSplit[1]
          }
        }
      }
      if (process.env.KUBERNETES !== 'true') {
        return this.getLocalServer();
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
