import { HookContext } from '@feathersjs/feathers'
import { extractLoggedInUserFromParams } from '../user/auth-management/auth-management.utils'
import { BadRequest } from '@feathersjs/errors'

// This will attach the owner ID in the contact while creating/updating list item
export default () => {
  return async (context: HookContext): Promise<HookContext> => {
    const { id, method, data, params, app } = context
    const loggedInUser = extractLoggedInUserFromParams(params)
    if (method === 'remove' || method === 'patch') {
      const match = await (app.service('message') as any).Model.findOne({
        where: {
          id: id,
          senderId: loggedInUser.id
        }
      })

      if (match == null) {
        throw new BadRequest('Message not owned by requesting user')
      }
    }
    return context
  }
}
