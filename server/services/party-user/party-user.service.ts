import { ServiceAddons } from '@feathersjs/feathers'
import { Application } from '../../declarations'
import { PartyUser } from './party-user.class'
import createModel from '../../models/party-user.model'
import hooks from './party-user.hooks'

declare module '../../declarations' {
  interface ServiceTypes {
    'party-user': PartyUser & ServiceAddons<any>
  }
}

export default (app: Application): void => {
  const options = {
    Model: createModel(app),
    paginate: app.get('paginate'),
    multi: true
  }

  app.use('/party-user', new PartyUser(options, app))

  const service = app.service('party-user')

  service.hooks(hooks)

  service.publish('created', async (data): Promise<any> => {
    console.log('Created party-user publishing')
    try {
      const channel = await app.service('channel').Model.findOne({
        where: {
          partyId: data.partyId
        }
      })
      if (channel != null) {
        await app.service('channel').patch(channel.id, {
          channelType: channel.channelType
        }, {
          sequelize: {
            silent: true
          }
        })
      }
      const partyUsers = await app.service('party-user').find({
        query: {
          $limit: 1000,
          partyId: data.partyId
        }
      })
      data.user = await app.service('user').get(data.userId)
      const avatarResult = await app.service('static-resource').find({
        query: {
          staticResourceType: 'user-thumbnail',
          userId: data.userId
        }
      }) as any

      if (avatarResult.total > 0) {
        data.user.dataValues.avatarUrl = avatarResult.data[0].url
      }
      const targetIds = (partyUsers as any).data.map((partyUser) => {
        return partyUser.userId
      })
      // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
      return Promise.all(targetIds.map((userId) => {
        return app.channel(`userIds/${userId}`).send({
          partyUser: data
        })
      }))
    } catch(err) {
      console.log(err)
      throw err
    }
  })

  service.publish('patched', async (data): Promise<any> => {
    console.log('Patched party-user publishing')
    try {
      const channel = await app.service('channel').Model.findOne({
        where: {
          partyId: data.partyId
        }
      })
      if (channel != null) {
        await app.service('channel').patch(channel.id, {
          channelType: channel.channelType,
          sequelize: {}
        }, {
          sequelize: {
            silent: true
          }
        })
      }
      console.log('Publishing party-user patched')
      console.log(data)
      const partyUsers = await app.service('party-user').find({
        query: {
          $limit: 1000,
          partyId: data.partyId
        }
      })
      data.user = await app.service('user').get(data.userId)
      const avatarResult = await app.service('static-resource').find({
        query: {
          staticResourceType: 'user-thumbnail',
          userId: data.userId
        }
      }) as any

      if (avatarResult.total > 0) {
        data.user.dataValues.avatarUrl = avatarResult.data[0].url
      }

      const targetIds = (partyUsers as any).data.map((partyUser) => {
        return partyUser.userId
      })
      console.log('party-user patch targetIds:')
      console.log(targetIds)
      // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
      return Promise.all(targetIds.map((userId) => {
        return app.channel(`userIds/${userId}`).send({
          partyUser: data
        })
      }))
    } catch(err) {
      console.log(err)
      throw err
    }
  })

  service.publish('removed', async (data): Promise<any> => {
    console.log('Removed party-user publishing')
    try {
      const channel = await app.service('channel').Model.findOne({
        where: {
          partyId: data.partyId
        }
      })
      if (channel != null) {
        await app.service('channel').patch(channel.id, {
          channelType: channel.channelType
        }, {
          sequelize: {
            silent: true
          }
        })
      }
      const partyUsers = await app.service('party-user').find({
        query: {
          $limit: 1000,
          partyId: data.partyId
        }
      })
      const targetIds = (partyUsers as any).data.map((partyUser) => {
        return partyUser.userId
      })
      targetIds.push(data.userId)
      // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
      return Promise.all(targetIds.map((userId) => {
        return app.channel(`userIds/${userId}`).send({
          partyUser: data
        })
      }))
    } catch(err) {
      console.log(err)
      throw err
    }
  })
}
