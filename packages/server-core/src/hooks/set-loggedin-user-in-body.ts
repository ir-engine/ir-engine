import { HookContext } from '@feathersjs/feathers'

import { UserDataType } from '../user/user/user.class'

// This will attach the owner ID in the contact while creating/updating list item
export default (propertyName: string) => {
  return (context: HookContext): HookContext => {
    // console.log('\n\n\n', context)
    // Getting logged in user and attaching owner of user
    const loggedInUser = context.params.user as UserDataType
    if (Array.isArray(context.data)) {
      context.data = context.data.map((item) => {
        return {
          ...item,
          [propertyName]: loggedInUser.id
        }
      })
    } else {
      context.data = {
        ...context.data,
        [propertyName]: loggedInUser.id
      }
      context.params.body = {
        ...context.params.body,
        [propertyName]: loggedInUser.id
      }
    }

    return context
  }
}
