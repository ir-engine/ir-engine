import { Application } from '../../../declarations'
import { Party } from './party.class'
import createModel from './party.model'
import hooks from './party.hooks'
import partyDocs from './party.docs'

declare module '../../../declarations' {
  interface ServiceTypes {
    party: Party
  }
}

export default (app: Application): void => {
  const options = {
    Model: createModel(app),
    paginate: app.get('paginate'),
    multi: true
  }

  /**
   * Initialize our service with any options it requires and docs
   *
   * @author Vyacheslav Solovjov
   */
  const event = new Party(options, app)
  event.docs = partyDocs

  app.use('party', event)

  const service = app.service('party')

  service.hooks(hooks)
  /**
   * A function which is used to create new party
   *
   * @param data of new party
   * @returns {@Object} created party
   * @author Vyacheslav Solovjov
   */
  service.publish('created', async (data): Promise<any> => {
    try {
      const partyUsers = (await app.service('party-user').find({
        query: {
          $limit: 1000,
          partyId: data.id
        }
      })) as any
      // await Promise.all(partyUsers.data.map(async (partyUser) => {
      // const avatarResult = await app.service('static-resource').find({
      //   query: {
      //     staticResourceType: 'user-thumbnail',
      //     userId: partyUser.userId
      //   }
      // }) as any;
      //
      // if (avatarResult.total > 0) {
      //   partyUser.dataValues.user.dataValues.avatarUrl = avatarResult.data[0].url;
      // }

      // return await Promise.resolve();
      // }));
      data.partyUsers = partyUsers.data
      const targetIds = partyUsers.data.map((partyUser) => {
        return partyUser.userId
      })
      // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
      return Promise.all(
        targetIds.map((userId: string) => {
          return app.channel(`userIds/${userId}`).send({
            party: data
          })
        })
      )
    } catch (err) {
      console.error(err)
      return err
    }
  })

  /**
   * A function which is used to update new party
   *
   * @param data of new party
   * @returns {@Object} of new updated party
   * @author Vyacheslav Solovjov
   */
  service.publish('patched', async (data): Promise<any> => {
    const partyUsers = await app.service('party-user').find({
      query: {
        $limit: 1000,
        partyId: data.id
      }
    })
    const targetIds = (partyUsers as any).data.map((partyUser) => {
      return partyUser.userId
    })
    // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
    return Promise.all(
      targetIds.map((userId: string) => {
        return app.channel(`userIds/${userId}`).send({
          party: data
        })
      })
    )
  })

  /**
   * A function which is used to remove single party
   *
   * @param data of single party
   * @returns {@Object} of removed data
   * @author Vyacheslav Solovjov
   */

  service.publish('removed', async (data): Promise<any> => {
    const partyUsers = await app.service('party-user').find({
      query: {
        $limit: 1000,
        partyId: data.id
      }
    })
    const targetIds = (partyUsers as any).data.map((partyUser) => {
      return partyUser.userId
    })
    // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
    return Promise.all(
      targetIds.map((userId: string) => {
        return app.channel(`userIds/${userId}`).send({
          party: data
        })
      })
    )
  })
}
