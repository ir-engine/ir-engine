import React, { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useLocation, useRouteMatch } from 'react-router-dom'

import { LoadingCircle } from '@xrengine/client-core/src/components/LoadingCircle'
import { LocationIcons } from '@xrengine/client-core/src/components/LocationIcons'
import { LoadEngineWithScene } from '@xrengine/client-core/src/components/World/LoadEngineWithScene'
import LoadLocationScene from '@xrengine/client-core/src/components/World/LoadLocationScene'
import NetworkInstanceProvisioning from '@xrengine/client-core/src/components/World/NetworkInstanceProvisioning'
import { OfflineLocation } from '@xrengine/client-core/src/components/World/OfflineLocation'
import { FriendService } from '@xrengine/client-core/src/social/services/FriendService'
import { LocationAction, useLocationState } from '@xrengine/client-core/src/social/services/LocationService'
import { AuthService } from '@xrengine/client-core/src/user/services/AuthService'
import { DefaultLocationSystems } from '@xrengine/client-core/src/world/DefaultLocationSystems'
import { SceneService } from '@xrengine/client-core/src/world/services/SceneService'
import { useEngineState } from '@xrengine/engine/src/ecs/classes/EngineState'
import { useHookEffect } from '@xrengine/hyperflux'
import { dispatchAction } from '@xrengine/hyperflux'

const LocationPage = () => {
  const { t } = useTranslation()
  const match = useRouteMatch()
  const { search } = useLocation()
  const engineState = useEngineState()
  const locationState = useLocationState()
  const offline = new URLSearchParams(search).get('offline') === 'true'

  const params = match.params as any
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
  useHookEffect(() => {
    if (locationState.currentLocation.location.sceneId.value) {
      const [project, scene] = locationState.currentLocation.location.sceneId.value.split('/')
      SceneService.fetchCurrentScene(project, scene)
    }
  }, [locationState.currentLocation.location.sceneId])

  return (
    <>
      {engineState.isEngineInitialized.value ? <></> : <LoadingCircle message={t('common:loader.loadingEngine')} />}
      <LoadEngineWithScene injectedSystems={DefaultLocationSystems} />
      {offline ? <OfflineLocation /> : <NetworkInstanceProvisioning />}
      <LoadLocationScene />
      <LocationIcons />
    </>
  )
}

export default LocationPage
