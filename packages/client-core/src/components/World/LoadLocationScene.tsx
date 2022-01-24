import { LocationAction, useLocationState } from '@xrengine/client-core/src/social/services/LocationService'
import { useDispatch } from '@xrengine/client-core/src/store'
import { AuthService, useAuthState } from '@xrengine/client-core/src/user/services/AuthService'
import React, { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useHistory } from 'react-router'
import { retriveLocationByName } from './LocationLoadHelper'

interface Props {
  locationName: string
}

export const LoadLocationScene = (props: Props) => {
  const { t } = useTranslation()
  const authState = useAuthState()
  const locationState = useLocationState()
  const history = useHistory()
  const isUserBanned = locationState.currentLocation.selfUserBanned.value
  const dispatch = useDispatch()

  /**
   * Try to log in
   */
  useEffect(() => {
    AuthService.doLoginAuto(true)
  }, [])

  /**
   * Once we have logged in, retrieve the location data
   */
  useEffect(() => {
    const selfUser = authState.user
    const currentLocation = locationState.currentLocation.location

    const isUserBanned =
      selfUser?.locationBans?.value?.find((ban) => ban.locationId === currentLocation.id.value) != null
    dispatch(LocationAction.socialSelfUserBanned(isUserBanned))

    if (!isUserBanned && !locationState.fetchingCurrentLocation.value) {
      retriveLocationByName(authState, props.locationName, history)
    }
  }, [authState.isLoggedIn.value, authState.user.id.value])

  if (isUserBanned) return <div className="banned">{t('location.youHaveBeenBannedMsg')}</div>

  return <> </>
}

export default LoadLocationScene
