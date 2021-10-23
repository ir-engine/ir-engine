import { Application } from '../../../declarations'
import { PartyUser } from './party-user.class'
import createModel from './party-user.model'
import hooks from './party-user.hooks'
import logger from '../../logger'
import partyUserDocs from './party-user.docs'

declare module '../../../declarations' {
  interface ServiceTypes {
    'party-user': PartyUser
  }
}

export default (app: Application): void => {
  const options = {
    Model: createModel(app),
    paginate: app.get('paginate'),
    multi: true
  }

  /**
   * An object for swagger documentation configiration
   *
   * @author Kevin KIMENYI
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
   * @author Vyacheslav Solovjov
   */

  service.publish('created', async (data): Promise<any> => {
    try {
      // const channel = await (app.service('channel') as any).Model.findOne({
      //   where: {
      //     partyId: data.partyId
      //   }
      // });
      // if (channel != null) {
      //   await app.service('channel').patch(channel.id, {
      //     channelType: channel.channelType
      //   }, {
      //     sequelize: {
      //       silent: true
      //     }
      //   });
      // }
      const partyUsers = await app.service('party-user').find({
        query: {
          $limit: 1000,
          partyId: data.partyId
        }
      })
      data.user = await app.service('user').get(data.userId)
      // const avatarResult = await app.service('static-resource').find({
      //   query: {
      //     staticResourceType: 'user-thumbnail',
      //     userId: data.userId
      //   }
      // }) as any;
      //
      // if (avatarResult.total > 0) {
      //   data.user.dataValues.avatarUrl = avatarResult.data[0].url;
      // }
      const targetIds = (partyUsers as any).data.map((partyUser) => {
        return partyUser.userId
      })
      // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
      return Promise.all(
        targetIds.map((userId: string) => {
          return app.channel(`userIds/${userId}`).send({
            partyUser: data
          })
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
   * @author Vyacheslav Solovjov
   */
  service.publish('patched', async (data): Promise<any> => {
    try {
      // const channel = await (app.service('channel') as any).Model.findOne({
      //   where: {
      //     partyId: data.partyId
      //   }
      // });
      // if (channel != null) {
      //   await app.service('channel').patch(channel.id, {
      //     channelType: channel.channelType,
      //     sequelize: {}
      //   }, {
      //     sequelize: {
      //       silent: true
      //     }
      //   });
      // }
      const partyUsers = await app.service('party-user').find({
        query: {
          $limit: 1000,
          partyId: data.partyId
        }
      })
      data.user = await app.service('user').get(data.userId)
      // const avatarResult = await app.service('static-resource').find({
      //   query: {
      //     staticResourceType: 'user-thumbnail',
      //     userId: data.userId
      //   }
      // }) as any;
      //
      // if (avatarResult.total > 0) {
      //   data.user.dataValues.avatarUrl = avatarResult.data[0].url;
      // }

      const targetIds = (partyUsers as any).data.map((partyUser) => {
        return partyUser.userId
      })
      // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
      return Promise.all(
        targetIds.map((userId: string) => {
          return app.channel(`userIds/${userId}`).send({
            partyUser: data
          })
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
   * @author Vyacheslav Solovjov
   */

  service.publish('removed', async (data): Promise<any> => {
    try {
      // const channel = await (app.service('channel') as any).Model.findOne({
      //   where: {
      //     partyId: data.partyId
      //   }
      // });
      // if (channel != null) {
      //   await app.service('channel').patch(channel.id, {
      //     channelType: channel.channelType
      //   }, {
      //     sequelize: {
      //       silent: true
      //     }
      //   });
      // }
      const partyUsers = await app.service('party-user').find({
        query: {
          $limit: 1000,
          partyId: data.partyId
        }
      })
      data.user = await app.service('user').get(data.userId)
      const targetIds = (partyUsers as any).data.map((partyUser) => {
        return partyUser.userId
      })
      targetIds.push(data.userId)
      await app.service('user').patch(data.userId, {
        partyId: null
      })
      // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
      return Promise.all(
        targetIds.map((userId: string) => {
          return app.channel(`userIds/${userId}`).send({
            partyUser: data
          })
        })
      )
    } catch (err) {
      logger.error(err)
      throw err
    }
  })
}
