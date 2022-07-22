import { HookContext } from '@feathersjs/feathers'
import _ from 'lodash'

import { Channel } from '@xrengine/common/src/interfaces/Channel'
import { Instance } from '@xrengine/common/src/interfaces/Instance'

import config from '../appconfig'
import getLocalServerIp, { ServerAddress } from '../util/get-local-server-ip'
import { Application } from './../../declarations'

export default () => {
  return async (context: HookContext<Application>): Promise<HookContext> => {
    let selfIpAddress: string
    let emittedIp: ServerAddress

    const party = await context.app.service('party').Model.findOne({ where: { id: context.result.id } })
    if (!party) return context

    const partyUserResult = await context.app.service('party-user').Model.findAndCountAll({
      where: { partyId: context.result.id }
    })

    const partyOwner = partyUserResult.rows.find((partyUser) => partyUser.isOwner === true)

    if (config.kubernetes.enabled) {
      const serverResult = (await context.app.k8AgonesClient.listNamespacedCustomObject(
        'agones.dev',
        'v1',
        'default',
        'gameservers'
      )) as any
      const readyServers = _.filter(serverResult?.body!.items, (server) => server.status.state === 'Ready')
      const server = readyServers[Math.floor(Math.random() * readyServers.length)]
      emittedIp = { ipAddress: server.status.address, port: server.status.ports[0].port.toString() }
      selfIpAddress = `${server.status.address as string}:${server.status.ports[0].port.toString()}`
    } else {
      emittedIp = await getLocalServerIp(true)
      selfIpAddress = `${emittedIp.ipAddress}:${emittedIp.port}`
    }

    const channel = (await context.app.service('channel').create({
      channelType: 'party',
      partyId: party.id
    })) as Channel

    if (!channel) return context

    const instance = (await context.app.service('instance').create({
      ipAddress: selfIpAddress,
      currentUsers: partyUserResult.count,
      channelId: channel.id
    })) as Instance

    // if (!config.kubernetes.enabled) {
    //   context.app.instance.id = instance.id
    // }

    await context.app.service('instance-provision').emit('created', {
      userId: partyOwner.userId,
      ipAddress: emittedIp.ipAddress,
      port: emittedIp.port,
      instanceId: instance.id,
      channelId: channel.id,
      channelType: channel.channelType
    })

    return context
  }
}
