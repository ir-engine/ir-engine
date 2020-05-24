import { HookContext } from '@feathersjs/feathers'
import { extractLoggedInUserFromParams } from '../services/auth-management/auth-management.utils'

// This will attach the owner ID in the contact while creating/updating list item
export default (propertyName: string) => {
  return (context: HookContext): HookContext => {
    // Getting logged in user and attaching owner of user
    const loggedInUser = extractLoggedInUserFromParams(context.params)
    context.data = {
      ...context.data,
      [propertyName]: loggedInUser.userId
    }
    context.data = {
      ...context.data,
      [propertyName]: loggedInUser.userId
    }

    return context
  }
}
