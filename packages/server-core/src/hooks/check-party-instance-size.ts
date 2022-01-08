import { HookContext } from '@feathersjs/feathers'
import _ from 'lodash'
import Sequelize, { Op } from 'sequelize'

import { Application } from '../../declarations'
import config from '../appconfig'
import logger from '../logger'
import getLocalServerIp from '../util/get-local-server-ip'

// This will attach the owner ID in the contact while creating/updating list item
export default () => {
  return async (context: HookContext): Promise<HookContext> => {
    try {
      // Getting logged in user and attaching owner of user
      const { result, params } = context
      const partyId = result.partyId
      const party = await context.app.service('party').get(partyId)
      const partyUserResult = await context.app.service('party-user').find({
        query: {
          partyId: partyId
        }
      })
      const partyOwner = partyUserResult.data.find((partyUser) => partyUser.isOwner === 1 || partyUser.isOwner === true)
      if (party.instanceId != null) {
        const instance = await context.app.service('instance').get(party.instanceId)
        const location = await context.app.service('location').get(instance.locationId)
        if (params.oldInstanceId !== instance.id && instance.currentUsers + 1 > location.maxUsersPerInstance) {
          logger.info('Putting party onto a new server')
          const availableLocationInstances = await (context.app.service('instance') as any).Model.findAll({
            where: {
              locationId: location.id,
              '$location.maxUsersPerInstance$': {
                [Op.gt]: Sequelize.literal(`\`instance\`\.\`currentUsers\` + ${partyUserResult.total}`)
              },
              ended: false
            },
            include: [
              {
                model: (context.app.service('location') as any).Model,
                where: {}
              }
            ]
          })
          if (availableLocationInstances.length === 0) {
            logger.info('Spinning up new instance server')
            let selfIpAddress, status
            const emittedIp = !config.kubernetes.enabled
              ? await getLocalServerIp(false)
              : { ipAddress: status.address, port: status.portsList[0].port }
            if (config.kubernetes.enabled) {
              const serverResult = await (context.app as Application).k8AgonesClient.get('gameservers')
              const readyServers = _.filter(serverResult.items, (server: any) => server.status.state === 'Ready')
              const server = readyServers[Math.floor(Math.random() * readyServers.length)]
              status = server.status
              selfIpAddress = `${server.status.address as string}:${server.status.portsList[0].port as string}`
            } else {
              const agonesSDK = (context.app as Application).agonesSDK
              const gsResult = await agonesSDK.getGameServer()
              status = gsResult.status
              selfIpAddress = `${emittedIp.ipAddress}:3031`
            }
            const instance = await context.app.service('instance').create({
              currentUsers: partyUserResult.total,
              locationId: location.id,
              ipAddress: selfIpAddress
            })
            if (!config.kubernetes.enabled) {
              ;(context.app as Application).instance.id = instance.id
            }

            await context.app.service('instance-provision').emit('created', {
              userId: partyOwner.userId,
              locationId: location.id,
              sceneId: location.sceneId,
              ipAddress: emittedIp.ipAddress,
              port: emittedIp.port
            })
          } else {
            logger.info('Putting party on existing server with space')
            const instanceModel = (context.app.service('instance') as any).Model
            const instanceUserSort = _.sortBy(
              availableLocationInstances,
              (instance: typeof instanceModel) => instance.currentUsers
            )
            const selectedInstance = instanceUserSort[0]
            if (!config.kubernetes.enabled) {
              ;(context.app as Application).instance.id = selectedInstance.id
            }
            logger.info('Putting party users on instance ' + selectedInstance.id)
            const addressSplit = selectedInstance.ipAddress.split(':')
            const emittedIp = !config.kubernetes.enabled
              ? await getLocalServerIp(false)
              : { ipAddress: addressSplit[0], port: addressSplit[1] }
            await context.app.service('instance-provision').emit('created', {
              userId: partyOwner.userId,
              locationId: location.id,
              sceneId: location.sceneId,
              instanceId: instance.id,
              ipAddress: emittedIp.ipAddress,
              port: emittedIp.port
            })
          }
        }
      }
      return context
    } catch (err) {
      logger.error('check-party-instance error')
      logger.error(err)
      return null!
    }
  }
}
