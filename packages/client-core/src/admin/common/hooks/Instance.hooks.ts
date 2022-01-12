import { useEffect } from 'react'

export const useFetchAdminInstance = (user, adminInstanceState, InstanceService) => {
  useEffect(() => {
    if (user?.id.value && adminInstanceState.updateNeeded.value) {
      InstanceService.fetchAdminInstances()
    }
  }, [user?.id?.value, adminInstanceState.updateNeeded.value])
}
