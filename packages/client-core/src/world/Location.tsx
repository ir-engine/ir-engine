import { t } from 'i18next'
import React, { useEffect } from 'react'
import { useParams } from 'react-router-dom'

import { LoadingCircle } from '@etherealengine/client-core/src/components/LoadingCircle'
import { LocationIcons } from '@etherealengine/client-core/src/components/LocationIcons'
import { useLoadLocationScene } from '@etherealengine/client-core/src/components/World/LoadLocationScene'
import ClientNetworkingSystem from '@etherealengine/client-core/src/networking/ClientNetworkingSystem'
import { LocationAction, LocationState } from '@etherealengine/client-core/src/social/services/LocationService'
import { WarningUIService } from '@etherealengine/client-core/src/systems/WarningUISystem'
import { AuthService } from '@etherealengine/client-core/src/user/services/AuthService'
import { DefaultLocationSystems } from '@etherealengine/client-core/src/world/DefaultLocationSystems'
import { SceneService } from '@etherealengine/client-core/src/world/services/SceneService'
import { AppLoadingState } from '@etherealengine/engine/src/common/AppLoadingService'
import { SystemModuleType } from '@etherealengine/engine/src/ecs/functions/SystemFunctions'
import { SystemUpdateType } from '@etherealengine/engine/src/ecs/functions/SystemUpdateType'
import { NetworkState } from '@etherealengine/engine/src/networking/NetworkState'
import { dispatchAction, getMutableState, useHookstate } from '@etherealengine/hyperflux'

import { useLoadEngineWithScene, useOfflineScene } from '../components/World/EngineHooks'

const networkingSystems = [
  {
    uuid: 'ee.client.core.ClientNetworkingSystem',
    type: SystemUpdateType.POST_RENDER,
    systemLoader: () => Promise.resolve({ default: ClientNetworkingSystem })
  }
] as SystemModuleType<any>[]

const useOnlineLocationHooks = (props: { locationName: string }) => {
  const locationState = useHookstate(getMutableState(LocationState))

  useEffect(() => {
    dispatchAction(LocationAction.setLocationName({ locationName: props.locationName }))

    getMutableState(NetworkState).config.set({
      world: true,
      media: true,
      friends: true,
      instanceID: true,
      roomID: false
    })
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

const LocationPage = () => {
  const params = useParams()
  const appState = useHookstate(getMutableState(AppLoadingState).state)

  useLoadLocationScene()

  const online = !!params.locationName

  if (online) {
    useOnlineLocationHooks({ locationName: params.locationName! })
  } else {
    useOfflineScene({ projectName: params.projectName!, sceneName: params.sceneName! })
  }

  AuthService.useAPIListeners()
  SceneService.useAPIListeners()

  const injectedSystems = [...DefaultLocationSystems]
  if (online) {
    injectedSystems.push(...networkingSystems)
  }

  useLoadEngineWithScene({ injectedSystems })

  return (
    <>
      {appState.value === 'START_STATE' && <LoadingCircle message={t('common:loader.loadingEngine')} />}
      <LocationIcons />
    </>
  )
}

export default LocationPage
