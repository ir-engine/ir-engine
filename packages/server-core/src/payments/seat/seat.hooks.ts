import * as authentication from '@feathersjs/authentication'
import { HookContext } from '@feathersjs/feathers'
import { BadRequest, NotFound } from '@feathersjs/errors'
import { iff, isProvider } from 'feathers-hooks-common'
// Don't remove this comment. It's needed to format import lines nicely.

const { authenticate } = authentication.hooks

export default {
  before: {
    all: [authenticate('jwt')],
    find: [
      iff(isProvider('external'), (async (context: HookContext): Promise<any> => {
        const { app, params } = context

        const ownedSubscription = await app.service('subscription').find({
          query: {
            userId: params['identity-provider']?.userId || (params as any).query.connection['identity-provider'].userId
          }
        })
        if (ownedSubscription.total === 0) {
          throw new BadRequest('NO SUBSCRIPTION')
        }
        ;(params as any).query.subscriptionId = ownedSubscription.data[0].id
        return context
      }) as any)
    ],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: [
      async (context: HookContext): Promise<HookContext> => {
        const { app, id, params } = context

        const ownedSubscription = await app.service('subscription').find({
          query: {
            userId: params['identity-provider']?.userId || (params as any).query.connection['identity-provider'].userId
          }
        })
        if (ownedSubscription.total === 0) {
          throw new BadRequest('NO SUBSCRIPTION')
        }
        const seatResult = await app.service('seat').get(id!)
        if (seatResult == null) {
          throw new NotFound()
        }
        if (seatResult.subscriptionId !== ownedSubscription.data[0].id) {
          throw new NotFound()
        }
        params.removedSeat = seatResult
        params.ownedSubscription = ownedSubscription.data[0]
        return context
      }
    ]
  },

  after: {
    all: [],
    find: [
      async (context: HookContext): Promise<HookContext> => {
        const { app, result } = context
        await Promise.all(
          result.data.map(async (seat: any) => {
            const user = await app.service('user').get(seat.userId)
            const identityProviderResult = await app.service('identity-provider').find({
              query: {
                type: 'email',
                userId: seat.userId
              }
            })
            if (user != null) {
              seat.user = {
                name: user.name
              }
            }
            if (identityProviderResult.total > 0) {
              seat.user = {
                ...seat.user,
                email: identityProviderResult.data[0].token
              }
            }
          })
        )
        return context
      }
    ],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: [
      async (context: HookContext): Promise<HookContext> => {
        const { app, params } = context
        const ownedSubscription = (params as any).ownedSubscription
        const update = {
          unusedSeats: (ownedSubscription.unusedSeats as number) + 1
        }
        if ((params as any).removedSeat.seatStatus === 'pending') {
          ;(update as any).pendingSeats = ownedSubscription.pendingSeats - 1
        } else if ((params as any).removedSeat.seatStatus === 'filled') {
          ;(update as any).filledSeats = ownedSubscription.filledSeats - 1
        }
        await app.service('subscription').patch(ownedSubscription.id, update)
        return context
      }
    ]
  },

  error: {
    all: [],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  }
} as any
