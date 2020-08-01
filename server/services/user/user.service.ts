import { ServiceAddons } from '@feathersjs/feathers'
import { Application } from '../../declarations'
import { User } from './user.class'
import createModel from '../../models/user.model'
import hooks from './user.hooks'
import _ from 'lodash'

declare module '../../declarations' {
  interface ServiceTypes {
    'user': User & ServiceAddons<any>
  }
}

export default (app: Application): void => {
  const options = {
    Model: createModel(app),
    paginate: app.get('paginate'),
    multi: true
  }

  app.use('/user', new User(options, app))

  const service = app.service('user')

  service.hooks(hooks)

  service.publish('patched', async (data, params): Promise<any> => {
    console.log('User patched publishing')
    try {
      console.log(data)
      const groupUsers = await app.service('group-user').Model.findAll({
        where: {
          userId: data.id
        }
      })
      console.log(`User's groupUsers:`)
      console.log(groupUsers)
      const partyUsers = await app.service('party-user').Model.findAll({
        where: {
          userId: data.id
        }
      })
      console.log(`User's partyUsers:`)
      console.log(partyUsers)
      const userRelationships = await app.service('user-relationship').Model.findAll({
        where: {
          userRelationshipType: 'friend',
          relatedUserId: data.id
        }
      })
      console.log(`User's friends:`)
      console.log(userRelationships)

      let targetIds = []
      let updatePromises = []

      groupUsers.forEach((groupUser) => {
        updatePromises.push(app.service('group-user').patch(groupUser.id, {
          groupUserRank: groupUser.groupUserRank
        }))
        targetIds.push(groupUser.userId)
      })
      partyUsers.forEach((partyUser) => {
        updatePromises.push(app.service('party-user').patch(partyUser.id, {
          isOwner: partyUser.isOwner
        }))
        targetIds.push(partyUser.userId)
      })
      userRelationships.forEach((userRelationship) => {
        updatePromises.push(app.service('user-relationship').patch(userRelationship.id, {
          userRelationshipType: userRelationship.userRelationshipType,
          userId: userRelationship.userId
        }, params))
        targetIds.push(userRelationship.userId)
        targetIds.push(userRelationship.relatedUserId)
      })

      await Promise.all(updatePromises)

      console.log('targetIds before uniq:')
      console.log(targetIds)
      targetIds = _.uniq(targetIds)
      console.log('targetIds after _.uniq:')
      console.log(targetIds)

      console.log('Updated all related entities')

      return Promise.all(targetIds.map((userId) => {
        return app.channel(`userIds/${userId}`).send({
          userRelationship: data
        })
      }))
    } catch(err) {
      console.log(err)
      throw err
    }
  })
}
