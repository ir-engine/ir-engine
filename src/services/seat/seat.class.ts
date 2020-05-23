import { Service, SequelizeServiceOptions } from 'feathers-sequelize'
import { Params } from '@feathersjs/feathers'
import { Application } from '../../declarations'
import { BadRequest } from '@feathersjs/errors'
import app from './../../app'

export class Seat extends Service {
  // prettier-ignore
  // prettier-ignore
  constructor (options: Partial<SequelizeServiceOptions>, app: Application) {
    super(options)
  }

  // prettier-ignore
  async create (data: any, params?: Params): Promise<any> {
    console.log('SEAT CREATION')
    const userId = (params as any).userId || (params as any).connection['identity-provider'].userId
    if (userId == null) {
      throw new Error('Invalid user')
    }

    console.log(userId)
    const subscription = await app.service('subscription').find({
      query: {
        status: true,
        userId: userId
      }
    })

    if ((subscription as any).total === 0) {
      throw new BadRequest('Not signed up for a subscription')
    }

    console.log(subscription)
    const { totalSeats, unusedSeats, filledSeats, pendingSeats } = (subscription as any).data[0]

    if (unusedSeats === 0 || filledSeats + pendingSeats === totalSeats) {
      throw new BadRequest('All available seats filled or pending')
    }

    if ((params as any).self === true) {
      console.log('Setting self seat')
      let existingSelfSeat = await super.find({
        query: {
          subscriptionId: data.subscriptionId,
          userId: userId,
        }
      })

      console.log(existingSelfSeat)

      if ((existingSelfSeat as any).total > 0) {
        await Promise.all((existingSelfSeat as any).data.map((seat: any) => { return super.remove(seat.id)}))
      }
      await super.create({
        subscriptionId: data.subscriptionId,
        userId: userId,
        seatStatus: 'filled'
      })

      await app.service('subscription').patch(data.subscriptionId, {
        unusedSeats: unusedSeats - 1,
        filledSeats: filledSeats + 1
      })
      return
    }
    else {
      const link = await app.service('magiclink').create({
        type: 'email',
        email: data.email,
        subscriptionId: data.subscriptionId
      })

      console.log(link)

      return await super.create({
        subscriptionId: data.subscriptionId,
        userId: (link as any).userId,
        seatStatus: 'pending'
      })
    }
  }
}
