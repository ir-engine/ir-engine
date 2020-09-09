import { HookContext } from '@feathersjs/feathers';
import { extractLoggedInUserFromParams } from '../services/auth-management/auth-management.utils';
import Sequelize, {Op} from "sequelize";
import _ from "lodash";
import {networkInterfaces} from "os";

const getLocalServer = () => {
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

// This will attach the owner ID in the contact while creating/updating list item
export default () => {
  return async (context: HookContext): Promise<HookContext> => {
    try {
      // Getting logged in user and attaching owner of user
      const {result} = context;
      const partyId = result.partyId;
      const party = await context.app.service('party').get(partyId);
      const partyUserResult = await context.app.service('party-user').find({
        query: {
          partyId: partyId
        }
      })
      console.log(`instanceId: ${party.instanceId}`);
      if (party.instanceId != null) {
        const instance = await context.app.service('instance').get(party.instanceId);
        console.log('instance:')
        console.log(instance)
        const location = await context.app.service('location').get(instance.locationId);
        console.log('location: ')
        console.log(location)
        console.log(instance.currentUsers + 1 > location.maxUsersPerInstance)
        if (instance.currentUsers + 1 > location.maxUsersPerInstance) {
          console.log('Putting party onto a new server')
          const availableLocationInstances = await context.app.service('instance').Model.findAll({
            where: {
              locationId: location.id
            },
            include: [
              {
                model: context.app.service('location').Model,
                where: {
                  maxUsersPerInstance: {
                    [Op.gt]: Sequelize.col('instance.currentUsers') + partyUserResult.total
                  }
                }
              }
            ]
          })
          console.log('availableLocationInstance:')
          console.log(availableLocationInstances);
          if (availableLocationInstances.length === 0) {
            console.log('Spinning up new instance server')
            const serverResult = await (context.app as any).k8Client.get('gameservers')
            const readyServers = _.filter(serverResult.items, (server: any) => server.status.state === 'Ready')
            const server = readyServers[Math.floor(Math.random() * readyServers.length)]
            const agonesSDK = (context.app as any).agonesSDK;
            const gsResult = await agonesSDK.getGameServer();
            const {status} = gsResult;
            const selfIpAddress = `${(status.address as string)}:${(status.portsList[0].port as string)}`
            const instanceResult = await context.app.service('instance').create({
              currentUsers: partyUserResult.total,
              locationId: location.id,
              ipAddress: selfIpAddress
            });
            await Promise.all(partyUserResult.data.map((partyUser) => {
              return context.app.service('user').patch(partyUser.userId, {
                instanceId: instanceResult.id
              })
            }));
            await context.app.service('party').patch(partyId, {
              instanceId: instanceResult.id
            });
          } else {
            console.log('Putting party on existing server with space')
            const instanceModel = context.app.service('instance').Model
            const instanceUserSort = _.sortBy(availableLocationInstances, (instance: typeof instanceModel) => instance.currentUsers)
            const selectedInstance = instanceUserSort[0];
            console.log('Putting party users on instance ' + selectedInstance.id)
            await Promise.all(partyUserResult.data.map((partyUser) => {
              return context.app.service('user').patch(partyUser.userId, {
                instanceId: selectedInstance.id
              })
            }));
            await context.app.service('party').patch(partyId, {
              instanceId: selectedInstance.id
            });
          }
        }
      }
      return context;
    } catch(err) {
      console.log('check-party-instance error')
      console.log(err)
    }
  }
}
