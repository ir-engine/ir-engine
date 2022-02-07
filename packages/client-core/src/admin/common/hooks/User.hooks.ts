import { useEffect } from 'react'

export const useFetchUsersAsAdmin = (user, adminUserState, UserService, search) => {
  useEffect(() => {
    if (user?.id.value && adminUserState.updateNeeded.value) {
      UserService.fetchUsersAsAdmin('increment', null)
    }
    UserService.fetchUsersAsAdmin('increment', search)
  }, [search, user?.id?.value, adminUserState.updateNeeded.value])
}

export const useFetchUserRole = (UserRoleService, userRole, user) => {
  useEffect(() => {
    const fetchData = async () => {
      UserRoleService.fetchUserRole()
    }
    const role = userRole ? userRole.updateNeeded.value : false
    if (role && user.id.value) fetchData()
  }, [userRole.updateNeeded.value, user.value])
}

export const useFetchStaticResource = (staticResourceService, staticResource, user) => {
  useEffect(() => {
    if (user.id.value && staticResource.updateNeeded.value) {
      staticResourceService.fetchStaticResource()
    }
  }, [staticResource.updateNeeded.value, user.value])
}

export const useFetchScopeType = (ScopeTypeService, adminScopeTypeState, user) => {
  useEffect(() => {
    if (adminScopeTypeState.updateNeeded.value && user.id.value) {
      ScopeTypeService.getScopeTypeService()
    }
  }, [adminScopeTypeState.updateNeeded.value, user.value])
}
