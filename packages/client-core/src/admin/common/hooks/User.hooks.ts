import { useEffect } from 'react'

export const useFetchUsersAsAdmin = (user, adminUserState, UserService) => {
  useEffect(() => {
    if (user?.id.value && adminUserState.updateNeeded.value) {
      UserService.fetchUsersAsAdmin()
    }
  }, [user?.id?.value, adminUserState.updateNeeded.value])
}
