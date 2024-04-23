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
import { useEffect } from 'react'

import { LocationService, LocationState } from '@etherealengine/client-core/src/social/services/LocationService'
import { getMutableState, useHookstate } from '@etherealengine/hyperflux'

import { assetPath, scenePath } from '@etherealengine/common/src/schema.type.module'
import { SceneState } from '@etherealengine/engine/src/scene/SceneState'
import { useGet } from '@etherealengine/spatial/src/common/functions/FeathersHooks'
import { RouterState } from '../../common/services/RouterService'
import { WarningUIService } from '../../systems/WarningUISystem'
import { SceneServices } from '../../world/SceneServices'

export const useLoadLocation = (props: { locationName: string }) => {
  const locationState = useHookstate(getMutableState(LocationState))
  const scene = useGet(scenePath, locationState.currentLocation.location.sceneId.value).data

  useEffect(() => {
    LocationState.setLocationName(props.locationName)
  }, [])

  useEffect(() => {
    if (locationState.locationName.value) LocationService.getLocationByName(locationState.locationName.value)
  }, [locationState.locationName.value])

  useEffect(() => {
    if (locationState.invalidLocation.value) {
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
        body: t('common:instanceServer.notAuthorizedAtLocation'),
        action: () => RouterState.navigate('/')
      })
    }
  }, [locationState.currentLocation.selfNotAuthorized])

  /**
   * Once we have the location, fetch the current scene data
   */
  useEffect(() => {
    if (
      !locationState.currentLocation.location.sceneId.value ||
      locationState.invalidLocation.value ||
      locationState.currentLocation.selfNotAuthorized.value ||
      !scene
    )
      return
    const sceneURL = scene.assetURL
    return SceneServices.setCurrentScene(sceneURL)
  }, [locationState.currentLocation.location.sceneId, scene])
}

export const useLoadScene = (props: { projectName: string; sceneName: string }) => {
  useEffect(() => {
    if (!props.sceneName || !props.projectName) return
    const sceneURL = `projects/${props.projectName}/${props.sceneName}`
    return SceneServices.setCurrentScene(sceneURL, true)
  }, [])
}

/** This is kind of a hack that we can fix once we drop .scene.json support */
export const useActiveLocationScene = () => {
  const locationSceneID = useHookstate(getMutableState(LocationState).currentLocation.location.sceneId).value
  const scenes = useHookstate(getMutableState(SceneState).scenes)
  const scene = useGet(assetPath, locationSceneID).data
  return !!locationSceneID && !!scene?.assetURL ? scenes.keys.find((id) => id.includes(scene?.assetURL)) : ''
}
