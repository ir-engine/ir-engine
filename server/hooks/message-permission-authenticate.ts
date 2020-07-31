import { HookContext } from '@feathersjs/feathers'
import { extractLoggedInUserFromParams } from '../services/auth-management/auth-management.utils'
import { BadRequest, Forbidden } from '@feathersjs/errors'

// This will attach the owner ID in the contact while creating/updating list item
export default () => {
  return async (context: HookContext): Promise<HookContext> => {
    const { id, method, data, params, app } = context
    const loggedInUser = extractLoggedInUserFromParams(params)
    const userId = loggedInUser.userId
    if (method === 'remove' || method === 'patch') {
      console.log(`Checking if message ${id} is owned by user ${userId}`)
      const match = await app.service('message').Model.findOne({
        where: {
          id: id,
          senderId: loggedInUser.userId
        }
      })

      console.log('Message ownership result:')
      console.log(match)

      if (match == null) {
        throw new BadRequest('Message not owned by requesting user')
      }
    }
    return context
  }
}
