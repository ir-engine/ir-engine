import '@feathersjs/transport-commons'

import { Application } from '../../../declarations'
import logger from '../../logger'
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

  /**
   * An object for swagger documentation configiration
   */
  const event = new PartyUser(options, app)
  event.docs = partyUserDocs

  app.use('party-user', event)

  const service = app.service('party-user')

  service.hooks(hooks)

  /**
   * A function which is used to create new party user
   *
   * @param data of new party
   * @returns {@Object} of created new party user
   */

  service.publish('created', async (data): Promise<any> => {
    data.isOwner = data.isOwner === 1 ? true : data.isOwner === 0 ? false : data.isOwner
    try {
      const partyUsers = await app.service('party-user').find({ query: { $limit: 1000, partyId: data.partyId } })
      const targetIds = partyUsers.map((partyUser) => partyUser.userId)

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

  /**
   * A function which is used to update party user
   *
   * @param data of new party user
   * @returns {@Object} updated party user
   */
  service.publish('patched', async (data): Promise<any> => {
    data.isOwner = data.isOwner === 1 ? true : data.isOwner === 0 ? false : data.isOwner
    try {
      const partyUsers = await app
        .service('party-user')
        .Model.findAll({ where: { partyId: data.partyId }, limit: 1000 })
      const targetIds = partyUsers.map((partyUser) => partyUser.userId)

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

  /**
   * A function which is used to remove party user
   *
   * @param data for single party user
   * @returns {@Object} removed party user
   */

  service.publish('removed', async (data): Promise<any> => {
    data.isOwner = data.isOwner === 1 ? true : data.isOwner === 0 ? false : data.isOwner
    try {
      const partyUsers = await app
        .service('party-user')
        .Model.findAll({ where: { partyId: data.partyId }, limit: 1000 })
      const targetIds = partyUsers.map((partyUser) => partyUser.userId)

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
