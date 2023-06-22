/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/EtherealEngine/etherealengine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Ethereal Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Ethereal Engine team.

All portions of the code written by the Ethereal Engine team are Copyright © 2021-2023 
Ethereal Engine. All Rights Reserved.
*/

import { HookContext } from '@feathersjs/feathers'
import _ from 'lodash'

import { Channel } from '@etherealengine/common/src/interfaces/Channel'
import { Instance } from '@etherealengine/common/src/interfaces/Instance'
import { getState } from '@etherealengine/hyperflux'

import config from '../appconfig'
import { ServerState } from '../ServerState'
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
      const serverResult = (await getState(ServerState).k8AgonesClient.listNamespacedCustomObject(
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

    context.app.service('instance-provision').emit('created', {
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
