import { HookContext } from '@feathersjs/feathers'
import config from 'config'

// Get the logged in user entity
const loggedInUserEntity: string = config.get('authentication.entity') || 'user'

// This will attach the owner ID in the contact while creating/updating list item
export default (propertyName: string) => {
  return (context: HookContext): HookContext => {
    // Getting logged in user and attaching owner of user
    const loggedInUser = context.params[loggedInUserEntity]
    context.data = {
      ...context.data,
      [propertyName]: loggedInUser.userId
    }

    return context
  }
}
