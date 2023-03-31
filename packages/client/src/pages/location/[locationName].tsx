import React, { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useLocation, useParams } from 'react-router-dom'

import { LoadingCircle } from '@etherealengine/client-core/src/components/LoadingCircle'
import { LocationIcons } from '@etherealengine/client-core/src/components/LocationIcons'
import { LoadEngineWithScene } from '@etherealengine/client-core/src/components/World/LoadEngineWithScene'
import LoadLocationScene from '@etherealengine/client-core/src/components/World/LoadLocationScene'
import { OfflineLocation } from '@etherealengine/client-core/src/components/World/OfflineLocation'
import ClientNetworkingSystem from '@etherealengine/client-core/src/networking/ClientNetworkingSystem'
import { FriendService } from '@etherealengine/client-core/src/social/services/FriendService'
import { LocationAction, useLocationState } from '@etherealengine/client-core/src/social/services/LocationService'
import { WarningUIService } from '@etherealengine/client-core/src/systems/WarningUISystem'
import { AuthService } from '@etherealengine/client-core/src/user/services/AuthService'
import { DefaultLocationSystems } from '@etherealengine/client-core/src/world/DefaultLocationSystems'
import { SceneService } from '@etherealengine/client-core/src/world/services/SceneService'
import { AppLoadingState } from '@etherealengine/engine/src/common/AppLoadingService'
import { SystemModuleType } from '@etherealengine/engine/src/ecs/functions/SystemFunctions'
import { SystemUpdateType } from '@etherealengine/engine/src/ecs/functions/SystemUpdateType'
import { dispatchAction, getMutableState, useHookstate, useState } from '@etherealengine/hyperflux'

const networkingSystems = [
  {
    uuid: 'ee.client.core.ClientNetworkingSystem',
    type: SystemUpdateType.POST_RENDER,
    systemLoader: () => Promise.resolve({ default: ClientNetworkingSystem })
  }
] as SystemModuleType<any>[]

const LocationPage = () => {
  const { t } = useTranslation()
  const params = useParams()
  const { search } = useLocation()
  const locationState = useLocationState()
  const offline = new URLSearchParams(search).get('offline') === 'true'
  const appState = useHookstate(getMutableState(AppLoadingState).state)

  const invalidLocationState = locationState.invalidLocation

  useEffect(() => {
    if (invalidLocationState.value) {
      WarningUIService.openWarning({
        title: t('common:instanceServer.invalidLocation'),
        body: `${t('common:instanceServer.cantFindLocation')} '${locationState.locationName.value}'. ${t(
          'common:instanceServer.misspelledOrNotExist'
        )}`
      })
    }
  }, [invalidLocationState])

  useEffect(() => {
    if (locationState.currentLocation.selfNotAuthorized.value) {
      WarningUIService.openWarning({
        title: t('common:instanceServer.notAuthorizedAtLocationTitle'),
        body: t('common:instanceServer.notAuthorizedAtLocation')
      })
    }
  }, [locationState.currentLocation.selfNotAuthorized])

  const locationName = params.locationName ?? `${params.projectName}/${params.sceneName}`

  AuthService.useAPIListeners()
  SceneService.useAPIListeners()
  FriendService.useAPIListeners()

  useEffect(() => {
    dispatchAction(LocationAction.setLocationName({ locationName }))
  }, [])

  /**
   * Once we have the location, fetch the current scene data
   */
  useEffect(() => {
    if (locationState.currentLocation.location.sceneId.value) {
      const [project, scene] = locationState.currentLocation.location.sceneId.value.split('/')
      SceneService.fetchCurrentScene(project, scene)
    }
  }, [locationState.currentLocation.location.sceneId])

  const systems = [...DefaultLocationSystems]
  if (!offline) {
    systems.push(...networkingSystems)
  }

  return (
    <>
      {appState.value === 'START_STATE' && <LoadingCircle message={t('common:loader.loadingEngine')} />}
      <LoadEngineWithScene injectedSystems={systems} />
      {offline && <OfflineLocation />}
      <LoadLocationScene />
      <LocationIcons />
    </>
  )
}

export default LocationPage
