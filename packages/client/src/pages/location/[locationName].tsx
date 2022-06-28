import React, { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useLocation, useRouteMatch } from 'react-router-dom'

import Layout from '@xrengine/client-core/src/components/Layout'
import { LoadingCircle } from '@xrengine/client-core/src/components/LoadingCircle'
import { LoadEngineWithScene } from '@xrengine/client-core/src/components/World/LoadEngineWithScene'
import LoadLocationScene from '@xrengine/client-core/src/components/World/LoadLocationScene'
import NetworkInstanceProvisioning from '@xrengine/client-core/src/components/World/NetworkInstanceProvisioning'
import OfflineLocation from '@xrengine/client-core/src/components/World/OfflineLocation'
import { LocationAction, useLocationState } from '@xrengine/client-core/src/social/services/LocationService'
import { AuthService } from '@xrengine/client-core/src/user/services/AuthService'
import { DefaultLocationSystems } from '@xrengine/client-core/src/world/DefaultLocationSystems'
import { SceneService } from '@xrengine/client-core/src/world/services/SceneService'
import { Engine } from '@xrengine/engine/src/ecs/classes/Engine'
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

  useEffect(() => {
    dispatchAction(LocationAction.setLocationName({ locationName }))
    Engine.instance.injectedSystems.push(...DefaultLocationSystems)
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
    <Layout useLoadingScreenOpacity pageTitle={t('location.locationName.pageTitle')}>
      {engineState.isEngineInitialized.value ? <></> : <LoadingCircle />}
      <LoadEngineWithScene />
      {offline ? <OfflineLocation /> : <NetworkInstanceProvisioning />}
      <LoadLocationScene />
    </Layout>
  )
}

export default LocationPage
