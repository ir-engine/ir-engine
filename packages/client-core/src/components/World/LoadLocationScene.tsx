import { t } from 'i18next'
import React, { useEffect } from 'react'
import { useTranslation } from 'react-i18next'

import {
  LocationAction,
  LocationService,
  LocationState
} from '@etherealengine/client-core/src/social/services/LocationService'
import { AuthState } from '@etherealengine/client-core/src/user/services/AuthService'
import { dispatchAction, getMutableState, useHookstate } from '@etherealengine/hyperflux'

import { WarningUIService } from '../../systems/WarningUISystem'
import { SceneService } from '../../world/services/SceneService'
import { loadSceneJsonOffline } from '../../world/utils'

export const useLoadLocation = (props: { locationName: string }) => {
  const locationState = useHookstate(getMutableState(LocationState))

  useEffect(() => {
    dispatchAction(LocationAction.setLocationName({ locationName: props.locationName }))
  }, [])

  useEffect(() => {
    if (locationState.invalidLocation.value) {
      WarningUIService.openWarning({
        title: t('common:instanceServer.invalidLocation'),
        body: `${t('common:instanceServer.cantFindLocation')} '${locationState.locationName.value}'. ${t(
          'common:instanceServer.misspelledOrNotExist'
        )}`
      })
    }
  }, [locationState.invalidLocation])

  useEffect(() => {
    if (locationState.currentLocation.selfNotAuthorized.value) {
      WarningUIService.openWarning({
        title: t('common:instanceServer.notAuthorizedAtLocationTitle'),
        body: t('common:instanceServer.notAuthorizedAtLocation')
      })
    }
  }, [locationState.currentLocation.selfNotAuthorized])

  /**
   * Once we have the location, fetch the current scene data
   */
  useEffect(() => {
    if (locationState.currentLocation.location.sceneId.value) {
      const [project, scene] = locationState.currentLocation.location.sceneId.value.split('/')
      SceneService.fetchCurrentScene(project, scene)
    }
  }, [locationState.currentLocation.location.sceneId])
}

export const useLoadScene = (props: { projectName: string; sceneName: string }) => {
  useEffect(() => {
    dispatchAction(LocationAction.setLocationName({ locationName: `${props.projectName}/${props.sceneName}` }))
    loadSceneJsonOffline(props.projectName, props.sceneName)
  }, [])
}

export const useLoadLocationScene = () => {
  const { t } = useTranslation()
  const authState = useHookstate(getMutableState(AuthState))
  const locationState = useHookstate(getMutableState(LocationState))
  const isUserBanned = locationState.currentLocation.selfUserBanned.value
  const userNotAuthorized = locationState.currentLocation.selfNotAuthorized.value

  /**
   * Once we have logged in, retrieve the location data
   */
  useEffect(() => {
    const selfUser = authState.user
    const currentLocation = locationState.currentLocation.location

    const isUserBanned =
      selfUser?.locationBans?.value?.find((ban) => ban.locationId === currentLocation.id.value) != null
    dispatchAction(LocationAction.socialSelfUserBanned({ banned: isUserBanned }))

    if (
      !isUserBanned &&
      !locationState.fetchingCurrentLocation.value &&
      locationState.locationName.value &&
      authState.isLoggedIn.value
    ) {
      LocationService.getLocationByName(locationState.locationName.value)
    }
  }, [authState.isLoggedIn.value, locationState.locationName.value])

  if (isUserBanned) return <div className="banned">{t('location.youHaveBeenBannedMsg')}</div>
  if (userNotAuthorized) return <div className="not-authorized">{t('location.notAuthorizedAtLocation')}</div>

  return null
}
