import '@feathersjs/transport-commons'

import Sequelize from 'sequelize'

import { Application, ServerMode } from '../../../declarations'
import logger from '../../ServerLogger'
import { PartyUser } from './party-user.class'
import partyUserDocs from './party-user.docs'
import hooks from './party-user.hooks'
import createModel from './party-user.model'

declare module '@xrengine/common/declarations' {
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

  if (app.serverMode !== ServerMode.API) return

  service.publish('created', async (data): Promise<any> => {
    data.isOwner = data.isOwner === 1 ? true : data.isOwner === 0 ? false : data.isOwner
    try {
      const partyUsers = await app.service('party-user').find({ query: { $limit: 1000, partyId: data.partyId } })
      const targetIds = partyUsers.data.map((partyUser) => partyUser.userId)

      data.user = await app.service('user').Model.findOne({
        where: { id: data.userId }
      })
      data.user.avatar = await app.service('avatar').get(data.user.avatarId)
      return Promise.all(
        targetIds.map((userId: string) => {
          return app.channel(`userIds/${userId}`).send({ partyUser: data })
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
      data.user.avatar = await app.service('avatar').get(data.user.avatarId)
      return Promise.all(
        targetIds.map((userId: string) => {
          return app.channel(`userIds/${userId}`).send({ partyUser: data })
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
      const targetIds = partyUsers.map((partyUser) => partyUser.userId)
      targetIds.push(data.userId)

      if (data.dataValues)
        data.dataValues.user = await app.service('user').Model.findOne({ where: { id: data.userId } })
      else data.user = await app.service('user').Model.findOne({ where: { id: data.userId } })
      return Promise.all(
        targetIds.map((userId: string) => {
          return app.channel(`userIds/${userId}`).send({ partyUser: data })
        })
      )
    } catch (err) {
      logger.error(err)
      throw err
    }
  })
}
