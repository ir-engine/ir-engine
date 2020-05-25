import { Service, SequelizeServiceOptions } from 'feathers-sequelize'
import { Params } from '@feathersjs/feathers'
import { Application } from '../../declarations'
import { BadRequest, NotFound } from '@feathersjs/errors'
import app from './../../app'

export class Seat extends Service {
  constructor (options: Partial<SequelizeServiceOptions>, app: Application) {
    super(options)
  }

  async create (data: any, params?: Params): Promise<any> {
    const userId = (params as any).userId || (params as any).connection['identity-provider'].userId
    if (userId == null) {
      throw new Error('Invalid user')
    }
    const subscription = await app.service('subscription').find({
      query: {
        status: true,
        userId: userId
      }
    })

    if ((subscription as any).total === 0) {
      throw new BadRequest('Not signed up for a subscription')
    }
    const { totalSeats, unusedSeats, filledSeats, pendingSeats } = (subscription as any).data[0]

    if (unusedSeats === 0 || (filledSeats as number) + (pendingSeats as number) === totalSeats) {
      throw new BadRequest('All available seats filled or pending')
    }

    if ((params as any).self === true) {
      const existingSelfSeat = await super.find({
        query: {
          subscriptionId: data.subscriptionId,
          userId: userId
        }
      })
      if ((existingSelfSeat as any).total > 0) {
        await Promise.all((existingSelfSeat as any).data.map((seat: any) => { return super.remove(seat.id) }))
      }
      await super.create({
        subscriptionId: data.subscriptionId,
        userId: userId,
        seatStatus: 'filled'
      })

      await app.service('subscription').patch(data.subscriptionId, {
        unusedSeats: (unusedSeats as number) - 1,
        filledSeats: (filledSeats as number) + 1
      })
    } else {
      const identityProvider = await app.service('identity-provider').find({
        query: {
          type: 'email',
          token: data.email
        }
      })
      const existingUserInSeat = (identityProvider as any).total > 0 ? await app.service('seat').find({
        query: {
          userId: (identityProvider as any).data[0].userId
        }
      }) : { total: 0 }
      if ((existingUserInSeat as any).total > 0) {
        throw new BadRequest('User already has a seat')
      }

      const link = await app.service('magiclink').create({
        type: 'email',
        email: data.email,
        subscriptionId: data.subscriptionId
      })
      const newIdentityProvider = await app.service('identity-provider').find({
        query: {
          type: (link as any).type,
          token: (link as any).email
        }
      })
      if ((newIdentityProvider as any).total === 0) {
        throw new BadRequest('Invalid email address')
      }
      const seat = await super.create({
        subscriptionId: data.subscriptionId,
        userId: (newIdentityProvider as any).data[0].userId,
        seatStatus: 'pending'
      })

      await app.service('subscription').patch(data.subscriptionId, {
        unusedSeats: (unusedSeats as number) - 1,
        pendingSeats: (pendingSeats as number) + 1
      })
      return seat
    }
  }

  async patch (id: string, data: any, params?: Params): Promise<any> {
    const subscriptionId = data.subscriptionId as string
    const subscription = await app.service('subscription').get(subscriptionId)
    if (subscription == null) {
      console.log('Attempt to patch subscription ' + subscriptionId + ' failed because that is not a valid subscription')
      throw new NotFound()
    }
    const seatResult = await super.find({
      query: {
        userId: id
      }
    })
    if ((seatResult as any).total === 0) {
      console.log('Attempt to patch user ' + id + ' into subscription ' + subscriptionId + ' failed because that user does not have a seat there.')
      throw new NotFound()
    }

    if ((seatResult as any).total > 1) {
      console.log('User has too many seats somehow')
      throw new BadRequest('User has too many seats')
    }

    const seat = (seatResult as any).data[0]
    if (seat.subscriptionId !== subscriptionId) {
      throw new BadRequest('User does not have a seat on that subscription')
    }
    if (seat.seatStatus === 'pending') {
      await super.patch(seat.id, {
        seatStatus: 'filled'
      })

      await app.service('subscription').patch(subscription.id, {
        pendingSeats: (subscription.pendingSeats as number) - 1,
        filledSeats: (subscription.pendingSeats as number) + 1
      })
    }

    return seat
  }
}
