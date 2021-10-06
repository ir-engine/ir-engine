import { User } from '@xrengine/common/src/interfaces/User'

export const UserAction = {
  loadedUsers: (users: User[]) => {
    return {
      type: 'ADMIN_LOADED_USERS' as const,
      users
    }
  },
  userCreated: (user: User) => {
    return {
      type: 'USER_ADMIN_CREATED' as const,
      user: user
    }
  },
  userPatched: (user: User) => {
    return {
      type: 'USER_ADMIN_PATCHED' as const,
      user: user
    }
  },
  userRoleRetrieved: (data: any) => {
    return {
      type: 'USER_ROLE_RETRIEVED' as const,
      types: data
    }
  },
  userRoleCreated: (data: any) => {
    return {
      type: 'USER_ROLE_CREATED' as const,
      types: data
    }
  },
  userAdminRemoved: (data) => {
    return {
      type: 'USER_ADMIN_REMOVED' as const,
      data: data
    }
  },
  userRoleUpdated: (data: any) => {
    return {
      type: 'USER_ROLE_UPDATED' as const,
      data: data
    }
  },
  searchedUser: (data: any) => {
    return {
      type: 'USER_SEARCH_ADMIN' as const,
      data: data
    }
  },
  fetchedSingleUser: (data: any) => {
    return {
      type: 'SINGLE_USER_ADMIN_LOADED' as const,
      data: data
    }
  },
  fetchedStaticResource: (data: any) => {
    return {
      type: 'STATIC_RESOURCE_RETRIEVED' as const,
      staticResource: data
    }
  },
  refetchSingleUser: () => {
    return {
      type: 'SINGLE_USER_ADMIN_REFETCH' as const
    }
  }
}

export type UserActionType = ReturnType<typeof UserAction[keyof typeof UserAction]>
