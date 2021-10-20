import { User } from '@xrengine/common/src/interfaces/User'
import { UserResult } from '@xrengine/common/src/interfaces/UserResult'
import { StaticResourceResult } from '@xrengine/common/src/interfaces/StaticResourceResult'
import { UserRoleResult } from '@xrengine/common/src/interfaces/UserRoleResult'
import { UserRole } from '@xrengine/common/src/interfaces/UserRole'

export const UserAction = {
  loadedUsers: (userResult: UserResult) => {
    return {
      type: 'ADMIN_LOADED_USERS' as const,
      userResult: userResult
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
  userRoleRetrieved: (data: UserRoleResult) => {
    return {
      type: 'USER_ROLE_RETRIEVED' as const,
      types: data
    }
  },
  userRoleCreated: (data: UserRole) => {
    return {
      type: 'USER_ROLE_CREATED' as const,
      types: data
    }
  },
  userAdminRemoved: (data: User) => {
    return {
      type: 'USER_ADMIN_REMOVED' as const,
      data: data
    }
  },
  userRoleUpdated: (data: User) => {
    return {
      type: 'USER_ROLE_UPDATED' as const,
      data: data
    }
  },
  searchedUser: (userResult: UserResult) => {
    return {
      type: 'USER_SEARCH_ADMIN' as const,
      userResult: userResult
    }
  },
  fetchedSingleUser: (data: User) => {
    return {
      type: 'SINGLE_USER_ADMIN_LOADED' as const,
      data: data
    }
  },
  fetchedStaticResource: (data: StaticResourceResult) => {
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
