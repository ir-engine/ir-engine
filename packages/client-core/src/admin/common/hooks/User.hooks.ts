import { useEffect } from 'react'

export const useFetchUsersAsAdmin = (user, adminUserState, UserService, search) => {
  useEffect(() => {
    if (user?.id.value && adminUserState.updateNeeded.value) {
      UserService.fetchUsersAsAdmin('increment', null)
    }
    UserService.fetchUsersAsAdmin('increment', search)
  }, [search, user?.id?.value, adminUserState.updateNeeded.value])
}
