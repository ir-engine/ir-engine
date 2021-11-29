import { HookContext } from '@feathersjs/feathers'
import config from '../appconfig'

// Get the logged in user entity
const loggedInUserEntity: string = config.authentication.entity

// This will attach the owner ID in the contact while creating/updating list item
export default (userRole: string) => {
  return async (context: HookContext): Promise<HookContext> => {
    console.log('restrict user role', context.params)
    if (context.params.isInternal) return context
    // Getting logged in user and attaching owner of user
    const loggedInUser = context.params[loggedInUserEntity]
    const user = await context.app.service('user').get(loggedInUser.userId)
    if (user.userRole !== userRole) {
      throw new Error('Must be admin to access this function')
    }

    return context
  }
}
