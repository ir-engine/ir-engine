import React, { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useLocation, useParams } from 'react-router-dom'

import { LoadingCircle } from '@etherealengine/client-core/src/components/LoadingCircle'
import { LocationIcons } from '@etherealengine/client-core/src/components/LocationIcons'
import { useLoadLocationScene } from '@etherealengine/client-core/src/components/World/LoadLocationScene'
import ClientNetworkingSystem from '@etherealengine/client-core/src/networking/ClientNetworkingSystem'
import { FriendService } from '@etherealengine/client-core/src/social/services/FriendService'
import {
  LocationAction,
  LocationState,
  useLocationState
} from '@etherealengine/client-core/src/social/services/LocationService'
import { WarningUIService } from '@etherealengine/client-core/src/systems/WarningUISystem'
import { AuthService } from '@etherealengine/client-core/src/user/services/AuthService'
import { DefaultLocationSystems } from '@etherealengine/client-core/src/world/DefaultLocationSystems'
import { SceneService } from '@etherealengine/client-core/src/world/services/SceneService'
import { AppLoadingState } from '@etherealengine/engine/src/common/AppLoadingService'
import { SystemModuleType } from '@etherealengine/engine/src/ecs/functions/SystemFunctions'
import { SystemUpdateType } from '@etherealengine/engine/src/ecs/functions/SystemUpdateType'
import { dispatchAction, getMutableState, useHookstate, useState } from '@etherealengine/hyperflux'

import { useLoadEngine, useLoadEngineWithScene, useOfflineScene } from '../components/World/EngineHooks'
import { loadSceneJsonOffline } from './utils'

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
  const appState = useHookstate(getMutableState(AppLoadingState).state)

  useLoadLocationScene()

  const online = !!params.locationName
  const locationName = params.locationName ?? `${params.projectName}/${params.sceneName}`

  if (online) {
    const locationState = useHookstate(getMutableState(LocationState))

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

    FriendService.useAPIListeners()
  } else {
    useEffect(() => {
      dispatchAction(LocationAction.setLocationName({ locationName: `${params.projectName}/${params.sceneName}` }))
      loadSceneJsonOffline(params.projectName, params.sceneName)
    }, [])

    useOfflineScene()
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
