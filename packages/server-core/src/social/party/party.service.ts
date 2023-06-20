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

import { Party as PartyDataType } from '@etherealengine/common/src/interfaces/Party'
import { getState } from '@etherealengine/hyperflux'

import { Application } from '../../../declarations'
import logger from '../../ServerLogger'
import { ServerMode, ServerState } from '../../ServerState'
import { Party } from './party.class'
import partyDocs from './party.docs'
import hooks from './party.hooks'
import createModel from './party.model'

declare module '@etherealengine/common/declarations' {
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

  if (getState(ServerState).serverMode !== ServerMode.API) return

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
