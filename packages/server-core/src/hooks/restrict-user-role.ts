import { HookContext } from '@feathersjs/feathers'

import { UserDataType } from '../user/user/user.class'

// This will attach the owner ID in the contact while creating/updating list item
export default (userRole: string) => {
  return async (context: HookContext): Promise<HookContext> => {
    // console.log('restrict user role', context.params)
    if (context.params.isInternal) return context
    // Getting logged in user and attaching owner of user
    const loggedInUser = context.params.user as UserDataType
    if (loggedInUser.userRole !== userRole) {
      throw new Error(`Must be ${userRole} to access this function`)
    }
    return context
  }
}
