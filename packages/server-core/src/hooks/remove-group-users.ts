import { HookContext } from '@feathersjs/feathers'
import _ from 'lodash'

// This will attach the owner ID in the contact while creating/updating list item
export default () => {
  return async (context: HookContext): Promise<HookContext> => {
    // Getting logged in user and attaching owner of user
    const { id, app, params } = context
    const groupUserResult = await app.service('group-user').find({
      query: {
        groupId: id || params.query?.groupId
      }
    })
    delete params.query!.groupId
    params.groupUsersRemoved = true
    await Promise.all(
      groupUserResult.data.map((groupUser) => {
        const paramsCopy = _.cloneDeep(params)
        paramsCopy.query!.groupId = id
        paramsCopy.query!.userId = groupUser.userId
        return app.service('group-user').remove(groupUser.id, paramsCopy)
      })
    )

    return context
  }
}
