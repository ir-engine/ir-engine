import { BadRequest, NotFound } from '@feathersjs/errors'
import { Params } from '@feathersjs/feathers'
import { SequelizeServiceOptions, Service } from 'feathers-sequelize'

import { Seat as SeatInterface } from '@xrengine/common/src/interfaces/Seat'

import { Application } from '../../../declarations'
import logger from '../../ServerLogger'

interface SeatParams extends Params {
  self: boolean
  userId?: string
}

export type SeatDataType = SeatInterface

/**
 * A class for Seat service
 */
export class Seat<T = SeatDataType> extends Service<T> {
  app: Application
  docs: any
  constructor(options: Partial<SequelizeServiceOptions>, app: Application) {
    super(options)
    this.app = app
  }

  async create(data: any, params?: SeatParams): Promise<T> {
    const userId = (params as any).userId || (params as any).connection['identity-provider'].userId
    if (userId == undefined) {
      throw new Error('Invalid user')
    }
    const subscription = await this.app.service('subscription').find({
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

    if (params?.self === true) {
      const existingSelfSeat = await super.find({
        query: {
          subscriptionId: data.subscriptionId,
          userId: userId
        }
      })
      if ((existingSelfSeat as any).total > 0) {
        await Promise.all(
          (existingSelfSeat as any).data.map((seat: any) => {
            return super.remove(seat.id)
          })
        )
      }
      const createSet: any = {
        subscriptionId: data.subscriptionId,
        userId: userId,
        seatStatus: 'filled'
      }
      const seat = await super.create({ ...createSet })

      await this.app.service('subscription').patch(data.subscriptionId, {
        unusedSeats: (unusedSeats as number) - 1,
        filledSeats: (filledSeats as number) + 1
      })
      return seat as T
    } else {
      const identityProvider = await this.app.service('identity-provider').find({
        query: {
          type: 'email',
          token: data.email
        }
      })
      const existingUserInSeat =
        (identityProvider as any).total > 0
          ? await this.app.service('seat').find({
              query: {
                userId: (identityProvider as any).data[0].userId
              }
            })
          : { total: 0 }
      if ((existingUserInSeat as any).total > 0) {
        throw new BadRequest('User already has a seat')
      }

      const link = await this.app.service('magic-link').create(
        {
          type: 'email',
          email: data.email,
          subscriptionId: data.subscriptionId
        },
        null!
      )
      const newIdentityProvider = await this.app.service('identity-provider').find({
        query: {
          type: (link as any).type,
          token: (link as any).email
        }
      })
      if ((newIdentityProvider as any).total === 0) {
        throw new BadRequest('Invalid email address')
      }
      const createSet: any = {
        subscriptionId: data.subscriptionId,
        userId: (newIdentityProvider as any).data[0].userId,
        seatStatus: 'pending'
      }
      const seat = await super.create({ ...createSet })

      await this.app.service('subscription').patch(data.subscriptionId, {
        unusedSeats: (unusedSeats as number) - 1,
        pendingSeats: (pendingSeats as number) + 1
      })
      return seat as T
    }
  }

  async patch(id: string, data: any): Promise<T> {
    const subscriptionId = data.subscriptionId as string
    const subscription = await this.app.service('subscription').get(subscriptionId)
    if (subscription == null) {
      logger.info(
        'Attempt to patch subscription ' + subscriptionId + ' failed because that is not a valid subscription'
      )
      throw new NotFound()
    }
    const seatResult = await super.find({
      query: {
        userId: id
      }
    })
    if ((seatResult as any).total === 0) {
      logger.info(
        'Attempt to patch user ' +
          id +
          ' into subscription ' +
          subscriptionId +
          ' failed because that user does not have a seat there.'
      )
      throw new NotFound()
    }

    if ((seatResult as any).total > 1) {
      logger.info('User has too many seats somehow')
      throw new BadRequest('User has too many seats')
    }

    const seat = (seatResult as any).data[0]
    if (seat.subscriptionId !== subscriptionId) {
      throw new BadRequest('User does not have a seat on that subscription')
    }
    if (seat.seatStatus === 'pending') {
      const patchSet: any = {
        seatStatus: 'filled'
      }
      await super.patch(seat.id, { ...patchSet })

      await this.app.service('subscription').patch(subscription.id, {
        pendingSeats: (subscription.pendingSeats as number) - 1,
        filledSeats: (subscription.pendingSeats as number) + 1
      })
    }

    return seat
  }
}
