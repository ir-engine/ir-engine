import React, { useEffect } from 'react'
import { useTranslation } from 'react-i18next'

import { LocationAction, useLocationState } from '@xrengine/client-core/src/social/services/LocationService'
import { useDispatch } from '@xrengine/client-core/src/store'
import { useAuthState } from '@xrengine/client-core/src/user/services/AuthService'
import { EngineActions } from '@xrengine/engine/src/ecs/classes/EngineState'
import { dispatchAction, useHookEffect } from '@xrengine/hyperflux'

import { retrieveLocationByName } from './LocationLoadHelper'

export const LoadLocationScene = () => {
  const { t } = useTranslation()
  const authState = useAuthState()
  const locationState = useLocationState()
  const isUserBanned = locationState.currentLocation.selfUserBanned.value
  const dispatch = useDispatch()

  /**
   * Once we have logged in, retrieve the location data
   */
  useHookEffect(() => {
    const selfUser = authState.user
    const currentLocation = locationState.currentLocation.location

    const isUserBanned =
      selfUser?.locationBans?.value?.find((ban) => ban.locationId === currentLocation.id.value) != null
    dispatch(LocationAction.socialSelfUserBanned(isUserBanned))

    if (
      !isUserBanned &&
      !locationState.fetchingCurrentLocation.value &&
      locationState.locationName.value &&
      authState.isLoggedIn.value
    ) {
      retrieveLocationByName(locationState.locationName.value)
    }
  }, [authState.isLoggedIn, locationState.locationName])

  useHookEffect(() => {
    if (authState.user.id.value) dispatchAction(EngineActions.connect({ id: authState.user.id.value }))
  }, [authState.user])

  if (isUserBanned) return <div className="banned">{t('location.youHaveBeenBannedMsg')}</div>

  return <> </>
}

export default LoadLocationScene
