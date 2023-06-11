import { Paginated } from '@feathersjs/feathers'

import { getState } from '@etherealengine/hyperflux'

import '@feathersjs/transport-commons'

import { InstanceInterface } from '@etherealengine/common/src/dbmodels/Instance'

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
      const avatar = await app.service('avatar').get(data.user.avatarId)
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
      const avatar = await app.service('avatar').get(data.user.avatarId)
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
