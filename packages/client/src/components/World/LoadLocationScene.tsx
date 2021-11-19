import { LocationAction, useLocationState } from '@xrengine/client-core/src/social/services/LocationService'
import { useDispatch } from '@xrengine/client-core/src/store'
import { AuthService } from '@xrengine/client-core/src/user/services/AuthService'
import { useAuthState } from '@xrengine/client-core/src/user/services/AuthService'
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useHistory } from 'react-router'
import { retriveLocationByName } from './LocationLoadHelper'

import styles from './Scene.module.scss'

interface Props {
  locationName: string
}

export const LoadLocationScene = (props: Props) => {
  const { t } = useTranslation()
  const authState = useAuthState()
  const locationState = useLocationState()
  const history = useHistory()
  const locationNotFound = locationState.locationNotFound
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

  if (isUserBanned) return <div className={styles['banned']}>{t('location.youHaveBeenBannedMsg')}</div>

  if (locationNotFound) return <div className={styles['location-not-found']}>{t('location.locationNotFoundMsg')}</div>

  return <> </>
}
