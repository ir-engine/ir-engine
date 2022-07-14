import { HookContext, HookOptions } from '@feathersjs/feathers'
import { disallow } from 'feathers-hooks-common'

import { UserInterface } from '@xrengine/common/src/interfaces/User'
import checkPartyInstanceSize from '@xrengine/server-core/src/hooks/check-party-instance-size'
import partyPermissionAuthenticate from '@xrengine/server-core/src/hooks/party-permission-authenticate'
import unsetSelfPartyOwner from '@xrengine/server-core/src/hooks/unset-self-party-owner'

import addAssociations from '../../hooks/add-associations'
import authenticate from '../../hooks/authenticate'
import isInternalRequest from '../../hooks/isInternalRequest'
import logger from '../../logger'

// Don't remove this comment. It's needed to format import lines nicely.

export default {
  before: {
    all: [authenticate(), isInternalRequest()],
    find: [],
    get: [],
    create: [
      async (context: HookContext): Promise<HookContext> => {
        try {
          const { app, params, data } = context
          const loggedInUser = params!.user as UserInterface
          const user = await app.service('user').get(loggedInUser.id!)
          const partyUserResult = await app.service('party-user').find({
            query: {
              userId: loggedInUser.id
            }
          })

          await Promise.all(
            partyUserResult.data.map((partyUser) => {
              return app.service('party-user').remove(partyUser.id, params)
            })
          )

          if (data.userId == null) {
            data.userId = loggedInUser.id
          }
          context.params.oldInstanceId = user.instanceId
          return context
        } catch (err) {
          logger.error(err)
          return null!
        }
      },
      partyPermissionAuthenticate()
    ],
    update: [disallow()],
    patch: [partyPermissionAuthenticate()],
    remove: []
  },

  after: {
    all: [],
    find: [],
    get: [addAssociations({ models: [{ model: 'user' }] })],
    create: [
      async (context: HookContext): Promise<HookContext> => {
        const { app, result } = context
        await app.service('user').patch(result.userId, {
          partyId: result.partyId
        })
        const user = await app.service('user').get(result.userId)
        await app.service('message').create(
          {
            targetObjectId: result.partyId,
            targetObjectType: 'party',
            text: `${user.name} joined the party`,
            isNotification: true
          },
          {
            'identity-provider': {
              userId: result.userId
            }
          }
        )
        return context
      },
      checkPartyInstanceSize()
    ],
    update: [],
    patch: [unsetSelfPartyOwner()],
    remove: []
  },

  error: {
    all: [],
    find: [],
    get: [],
    create: [],
    update: [disallow()],
    patch: [],
    remove: []
  }
} as HookOptions<any, any>
