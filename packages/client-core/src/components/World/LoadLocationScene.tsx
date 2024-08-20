/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/ir-engine/ir-engine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Infinite Reality Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Infinite Reality Engine team.

All portions of the code written by the Infinite Reality Engine team are Copyright © 2021-2023 
Infinite Reality Engine. All Rights Reserved.
*/

import { t } from 'i18next'
import { useEffect } from 'react'

import { LocationService, LocationState } from '@ir-engine/client-core/src/social/services/LocationService'
import { staticResourcePath } from '@ir-engine/common/src/schema.type.module'
import { GLTFAssetState } from '@ir-engine/engine/src/gltf/GLTFState'
import { getMutableState, useMutableState } from '@ir-engine/hyperflux'
import { useFind, useGet } from '@ir-engine/spatial/src/common/functions/FeathersHooks'

import { RouterState } from '../../common/services/RouterService'
import { WarningUIService } from '../../systems/WarningUISystem'

export const useLoadLocation = (props: { locationName: string }) => {
  const locationState = useMutableState(LocationState)
  const scene = useGet(staticResourcePath, locationState.currentLocation.location.sceneId.value).data

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
    const sceneURL = scene.url
    return GLTFAssetState.loadScene(sceneURL, scene.id)
  }, [locationState.currentLocation.location.sceneId, scene])
}

export const useLoadScene = (props: { projectName: string; sceneName: string }) => {
  const sceneKey = `projects/${props.projectName}/${props.sceneName}`
  const assetID = useFind(staticResourcePath, { query: { key: sceneKey, type: 'scene' } })

  useEffect(() => {
    if (!props.sceneName || !props.projectName) return
    if (!assetID.data.length) return
    getMutableState(LocationState).currentLocation.location.sceneId.set(assetID.data[0].id)
    return GLTFAssetState.loadScene(assetID.data[0].url, assetID.data[0].id)
  }, [assetID.data.length])
}
