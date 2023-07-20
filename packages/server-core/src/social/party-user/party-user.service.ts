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

import { Paginated } from '@feathersjs/feathers'

import { getState } from '@etherealengine/hyperflux'

import '@feathersjs/transport-commons'

import { InstanceInterface } from '@etherealengine/common/src/dbmodels/Instance'
import { avatarPath } from '@etherealengine/engine/src/schemas/user/avatar.schema'

import { Application } from '../../../declarations'
import logger from '../../ServerLogger'
import { ServerMode, ServerState } from '../../ServerState'
import { PartyUser } from './party-user.class'
import partyUserDocs from './party-user.docs'
import hooks from './party-user.hooks'
import createModel from './party-user.model'

declare module '@etherealengine/common/declarations' {
  interface ServiceTypes {
    'party-user': PartyUser
  }
}

export default (app: Application): void => {
  const options = {
    Model: createModel(app.get('sequelizeClient')),
    paginate: app.get('paginate'),
    multi: true
  }

  const event = new PartyUser(options, app)
  event.docs = partyUserDocs

  app.use('party-user', event)

  const service = app.service('party-user')

  service.hooks(hooks)

  if (getState(ServerState).serverMode !== ServerMode.API) return

  service.publish('created', async (data): Promise<any> => {
    data.isOwner = data.isOwner === 1 ? true : data.isOwner === 0 ? false : data.isOwner
    try {
      const partyUsers = await app.service('party-user').find({ query: { $limit: 1000, partyId: data.partyId } })
      const targetIds = partyUsers.data.map((partyUser) => partyUser.userId)

      data.user = await app.service('user').Model.findOne({
        where: { id: data.userId }
      })
      const avatar = await app.service(avatarPath).get(data.user.avatarId)
      if (data.user.dataValues) data.user.dataValues.avatar = avatar
      else data.user.avatar = avatar
      return Promise.all(
        targetIds.map((userId: string) => {
          return app.channel(`userIds/${userId}`).send(data)
        })
      )
    } catch (err) {
      logger.error(err)
      throw err
    }
  })

  service.publish('patched', async (data): Promise<any> => {
    data.isOwner = data.isOwner === 1 ? true : data.isOwner === 0 ? false : data.isOwner
    try {
      const partyUsers = await app
        .service('party-user')
        .Model.findAll({ where: { partyId: data.partyId }, limit: 1000 })
      const targetIds = partyUsers.map((partyUser) => partyUser.userId)

      data.user = await app.service('user').Model.findOne({
        where: { id: data.userId }
      })
      const avatar = await app.service(avatarPath).get(data.user.avatarId)
      if (data.user.dataValues) data.user.dataValues.avatar = avatar
      else data.user.avatar = avatar
      return Promise.all(
        targetIds.map((userId: string) => {
          return app.channel(`userIds/${userId}`).send(data)
        })
      )
    } catch (err) {
      logger.error(err)
      throw err
    }
  })

  service.publish('removed', async (data): Promise<any> => {
    data.isOwner = data.isOwner === 1 ? true : data.isOwner === 0 ? false : data.isOwner
    try {
      const partyUsers = await app
        .service('party-user')
        .Model.findAll({ where: { partyId: data.partyId }, limit: 1000 })
      const partyChannel = await app.service('channel').Model.findOne({
        where: {
          channelType: 'party',
          partyId: data.partyId
        }
      })
      const partyInstance = partyChannel
        ? ((await app.service('instance').find({
            query: {
              channelId: partyChannel.id
            }
          })) as Paginated<InstanceInterface>)
        : { total: 0 }
      const targetIds = partyUsers.map((partyUser) => partyUser.userId)
      targetIds.push(data.userId)

      if (data.dataValues) {
        data.dataValues.user = await app.service('user').Model.findOne({ where: { id: data.userId } })
        if (partyInstance.total > 0) data.dataValues.partyInstance = partyInstance[0]
      } else {
        data.user = await app.service('user').Model.findOne({ where: { id: data.userId } })
        if (partyInstance.total > 0) data.partyInstance = partyInstance[0]
      }
      return Promise.all(
        targetIds.map((userId: string) => {
          return app.channel(`userIds/${userId}`).send(data)
        })
      )
    } catch (err) {
      logger.error(err)
      throw err
    }
  })
}
