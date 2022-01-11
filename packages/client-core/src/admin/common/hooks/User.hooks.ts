import { useEffect } from 'react'

export const useFetchUsersAsAdmin = (user, adminUserState, UserService) => {
  useEffect(() => {
    if (user?.id.value != null && adminUserState.updateNeeded.value === true) {
      UserService.fetchUsersAsAdmin()
    }
  }, [user?.id?.value, adminUserState.updateNeeded.value])
}
