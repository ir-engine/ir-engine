import { Party as PartyDataType } from '@xrengine/common/src/interfaces/Party'

import { Application } from '../../../declarations'
import logger from '../../logger'
import { Party } from './party.class'
import partyDocs from './party.docs'
import hooks from './party.hooks'
import createModel from './party.model'

declare module '@xrengine/common/declarations' {
  interface ServiceTypes {
    party: Party
  }
}

export default (app: Application): void => {
  const options = {
    Model: createModel(app.get('sequelizeClient')),
    paginate: app.get('paginate'),
    multi: true
  }

  /**
   * Initialize our service with any options it requires and docs
   */
  const event = new Party(options, app)
  event.docs = partyDocs

  app.use('party', event)

  const service = app.service('party')

  service.hooks(hooks)
  // /**
  //  * A function which is used to create new party
  //  *
  //  * @param data of new party
  //  * @returns {@Object} created party
  //  */
  service.publish('created', async (data: PartyDataType): Promise<any> => {
    try {
      const targetIds = data.partyUsers.map((partyUser) => partyUser.userId)
      return Promise.all(
        targetIds.map((userId: string) => {
          return app.channel(`userIds/${userId}`).send({ party: data })
        })
      )
    } catch (err) {
      logger.error(err)
      return err
    }
  })

  /**
   * A function which is used to update new party
   *
   * @param data of new party
   * @returns {@Object} of new updated party
   */
  service.publish('patched', async (data: PartyDataType): Promise<any> => {
    const partyUsers = await app.service('party-user').Model.findAll({ where: { partyId: data.id }, limit: 1000 })
    const targetIds = partyUsers.map((partyUser) => partyUser.userId)

    return Promise.all(
      targetIds.map((userId: string) => {
        return app.channel(`userIds/${userId}`).send({ party: data })
      })
    )
  })

  /**
   * A function which is used to remove single party
   *
   * @param data of single party
   * @returns {@Object} of removed data
   */

  service.publish('removed', async (data: PartyDataType): Promise<any> => {
    const partyUsers = await app.service('party-user').Model.findAll({ where: { partyId: data.id }, limit: 1000 })
    const targetIds = partyUsers.map((partyUser) => partyUser.userId)

    return Promise.all(
      targetIds.map((userId: string) => {
        return app.channel(`userIds/${userId}`).send({ party: data })
      })
    )
  })
}
