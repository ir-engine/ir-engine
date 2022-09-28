import { Party as PartyDataType } from '@xrengine/common/src/interfaces/Party'

import { Application, ServerMode } from '../../../declarations'
import logger from '../../ServerLogger'
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

  const event = new Party(options, app)
  event.docs = partyDocs

  app.use('party', event)

  const service = app.service('party')

  service.hooks(hooks)

  if (app.serverMode !== ServerMode.API) return

  service.publish('created', async (data: PartyDataType): Promise<any> => {
    try {
      const targetIds = data.party_users?.map((partyUser) => partyUser.userId) || []
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

  service.publish('patched', async (data: PartyDataType): Promise<any> => {
    const partyUsers = await app.service('party-user').Model.findAll({ where: { partyId: data.id }, limit: 1000 })
    const targetIds = partyUsers.map((partyUser) => partyUser.userId)

    return Promise.all(
      targetIds.map((userId: string) => {
        return app.channel(`userIds/${userId}`).send({ party: data })
      })
    )
  })

  service.publish('removed', async (data: PartyDataType): Promise<any> => {
    if (data.party_users) {
      const targetIds = data.party_users.map((partyUser) => partyUser.userId) || []

      return Promise.all(
        targetIds.map((userId: string) => {
          return app.channel(`userIds/${userId}`).send({ party: data })
        })
      )
    } else {
      return Promise.resolve()
    }
  })
}
