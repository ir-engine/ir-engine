import { useEffect } from 'react'

export const useFetchLocation = (user, adminLocationState, adminScopeReadErrMsg, search, LocationService) => {
  useEffect(() => {
    if (user?.id?.value && adminLocationState.updateNeeded.value && !adminScopeReadErrMsg?.value) {
      LocationService.fetchAdminLocations('increment', null)
    }
    // if (search) {
    LocationService.fetchAdminLocations('increment', search)
    // }
  }, [search, user?.id?.value, adminLocationState.updateNeeded.value])
}

export const useFetchAdminScenes = (user: any, SceneService: any) => {
  useEffect(() => {
    if (user?.id.value) {
      // && adminSceneState.scenes.updateNeeded.value === true) {
      SceneService.fetchAdminScenes('all')
    }
  }, [user?.id?.value])
}

export const useFetchLocationTypes = (user, adminLocationState, LocationService) => {
  useEffect(() => {
    if (user?.id.value && adminLocationState.updateNeeded.value) {
      LocationService.fetchLocationTypes()
    }
  }, [adminLocationState.updateNeeded.value, user?.id?.value])
}

export const useFetchAdminLocations = (user, adminLocationState, LocationService) => {
  useEffect(() => {
    if (user?.id.value && adminLocationState.updateNeeded.value) {
      LocationService.fetchAdminLocations()
    }
  }, [user?.id?.value, adminLocationState.updateNeeded.value])
}
