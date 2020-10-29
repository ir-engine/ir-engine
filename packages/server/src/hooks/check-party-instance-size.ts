import { HookContext } from '@feathersjs/feathers';
import Sequelize, {Op} from "sequelize";
import _ from "lodash";
import getLocalServerIp from "../util/get-local-server-ip";

// This will attach the owner ID in the contact while creating/updating list item
export default () => {
  return async (context: HookContext): Promise<HookContext> => {
    try {
      // Getting logged in user and attaching owner of user
      const {result, params} = context;
      const partyId = result.partyId;
      const party = await context.app.service('party').get(partyId);
      const partyUserResult = await context.app.service('party-user').find({
        query: {
          partyId: partyId
        }
      });
      const partyOwner = partyUserResult.data.find((partyUser) => (partyUser.isOwner === 1 || partyUser.isOwner === true));
      if (party.instanceId != null) {
        const instance = await context.app.service('instance').get(party.instanceId);
        const location = await context.app.service('location').get(instance.locationId);
        console.log(instance.currentUsers + 1 > location.maxUsersPerInstance);
        if (params.oldInstanceId !== instance.id && instance.currentUsers + 1 > location.maxUsersPerInstance) {
          console.log('Putting party onto a new server');
          const availableLocationInstances = await context.app.service('instance').Model.findAll({
            where: {
              locationId: location.id,
              '$location.maxUsersPerInstance$': {
                [Op.gt]: Sequelize.literal(`\`instance\`\.\`currentUsers\` + ${partyUserResult.total}`)
              }
            },
            include: [
              {
                model: context.app.service('location').Model,
                where: {
                }
              }
            ]
          });
          console.log('availableLocationInstances count: ' + availableLocationInstances.length);
          if (availableLocationInstances.length === 0) {
            console.log('Spinning up new instance server');
            let selfIpAddress, status;
            const emittedIp = (process.env.KUBERNETES !== 'true') ? await getLocalServerIp() : { ipAddress: status.address, port: status.portsList[0].port};
            if (process.env.KUBERNETES === 'true') {
              const serverResult = await (context.app as any).k8AgonesClient.get('gameservers');
              const readyServers = _.filter(serverResult.items, (server: any) => server.status.state === 'Ready');
              const server = readyServers[Math.floor(Math.random() * readyServers.length)];
              status = server.status;
              selfIpAddress = `${(server.status.address as string)}:${(server.status.portsList[0].port as string)}`;
            }
            else {
              const agonesSDK = (context.app as any).agonesSDK;
              const gsResult = await agonesSDK.getGameServer();
              status = gsResult.status;
              selfIpAddress = `${emittedIp.ipAddress}:3030`;
            }
            const instance = await context.app.service('instance').create({
              currentUsers: partyUserResult.total,
              locationId: location.id,
              ipAddress: selfIpAddress
            });
            if (process.env.KUBERNETES !== 'true') {
              (context.app as any).instance.id = instance.id;
            }

            await context.app.service('instance-provision').emit('created', {
              userId: partyOwner.userId,
              locationId: location.id,
              ipAddress: emittedIp.ipAddress,
              port: emittedIp.port
            });
          } else {
            console.log('Putting party on existing server with space');
            const instanceModel = context.app.service('instance').Model;
            const instanceUserSort = _.sortBy(availableLocationInstances, (instance: typeof instanceModel) => instance.currentUsers);
            const selectedInstance = instanceUserSort[0];
            if (process.env.KUBERNETES !== 'true') {
              (context.app as any).instance.id = selectedInstance.id;
            }
            console.log('Putting party users on instance ' + selectedInstance.id);
            const addressSplit = selectedInstance.ipAddress.split(':');
            const emittedIp = (process.env.KUBERNETES !== 'true') ? await getLocalServerIp() : { ipAddress: addressSplit[0], port: addressSplit[1]};
            await context.app.service('instance-provision').emit('created', {
              userId: partyOwner.userId,
              locationId: location.id,
              instanceId: instance.id,
              ipAddress: emittedIp.ipAddress,
              port: emittedIp.port
            });
          }
        }
      }
      return context;
    } catch(err) {
      console.log('check-party-instance error');
      console.log(err);
    }
  };
};
