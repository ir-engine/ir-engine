import { HookContext } from '@feathersjs/feathers'
import { extractLoggedInUserFromParams } from '../services/auth-management/auth-management.utils'
import { BadRequest, Forbidden } from '@feathersjs/errors'

// This will attach the owner ID in the contact while creating/updating list item
export default () => {
  return async (context: HookContext): Promise<HookContext> => {
    console.log('REMOVING GROUP USERS')
    // Getting logged in user and attaching owner of user
    const { id, app, params } = context
    console.log(params)
    const groupUserResult = await app.service('group-user').find({
      query: {
        groupId: id || params.query?.groupId
      }
    })
    console.log(groupUserResult)
    await Promise.all(groupUserResult.data.map((groupUser) => {
      return app.service('group-user').remove(groupUser.id)
    }))

    return context
  }
}
