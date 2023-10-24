/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/EtherealEngine/etherealengine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Ethereal Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Ethereal Engine team.

All portions of the code written by the Ethereal Engine team are Copyright © 2021-2023 
Ethereal Engine. All Rights Reserved.
*/

import { t } from 'i18next'
import React, { useEffect } from 'react'
import { useTranslation } from 'react-i18next'

import { LocationService, LocationState } from '@etherealengine/client-core/src/social/services/LocationService'
import { AuthState } from '@etherealengine/client-core/src/user/services/AuthService'
import { AppLoadingState, AppLoadingStates } from '@etherealengine/engine/src/common/AppLoadingService'
import { getMutableState, useHookstate } from '@etherealengine/hyperflux'

import { SceneServices } from '@etherealengine/engine/src/ecs/classes/Scene'
import { RouterState } from '../../common/services/RouterService'
import { WarningUIService } from '../../systems/WarningUISystem'
import { loadSceneJsonOffline } from '../../world/utils'

export const useLoadLocation = (props: { locationName: string }) => {
  const locationState = useHookstate(getMutableState(LocationState))

  useEffect(() => {
    LocationState.setLocationName(props.locationName)
  }, [])

  useEffect(() => {
    if (locationState.invalidLocation.value) {
      getMutableState(AppLoadingState).merge({
        state: AppLoadingStates.FAIL,
        loaded: false
      })
      WarningUIService.openWarning({
        title: t('common:instanceServer.invalidLocation'),
        body: `${t('common:instanceServer.cantFindLocation')} '${locationState.locationName.value}'. ${t(
          'common:instanceServer.misspelledOrNotExist'
        )}`,
        action: () => RouterState.navigate('/')
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
      SceneServices.setCurrentScene(project, scene)
    }
  }, [locationState.currentLocation.location.sceneId])
}

export const useLoadScene = (props: { projectName: string; sceneName: string }) => {
  useEffect(() => {
    LocationState.setLocationName(`${props.projectName}/${props.sceneName}`)
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
    LocationState.socialSelfUserBanned(isUserBanned)

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
