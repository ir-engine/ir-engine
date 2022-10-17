import React, { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useRouteMatch } from 'react-router-dom'

import { LoadingCircle } from '@xrengine/client-core/src/components/LoadingCircle'
import { LocationIcons } from '@xrengine/client-core/src/components/LocationIcons'
import { LoadEngineWithScene } from '@xrengine/client-core/src/components/World/LoadEngineWithScene'
import { OfflineLocation } from '@xrengine/client-core/src/components/World/OfflineLocation'
import { LocationAction } from '@xrengine/client-core/src/social/services/LocationService'
import { DefaultLocationSystems } from '@xrengine/client-core/src/world/DefaultLocationSystems'
import { useEngineState } from '@xrengine/engine/src/ecs/classes/EngineState'
import { dispatchAction } from '@xrengine/hyperflux'

import { loadSceneJsonOffline } from './utils'

const LocationPage = () => {
  const { t } = useTranslation()
  const match = useRouteMatch()
  const engineState = useEngineState()

  const params = match.params as any

  useEffect(() => {
    dispatchAction(LocationAction.setLocationName({ locationName: `${params.projectName}/${params.sceneName}` }))
    loadSceneJsonOffline(params.projectName, params.sceneName)
  }, [])

  return (
    <>
      {engineState.isEngineInitialized.value ? <></> : <LoadingCircle message={t('common:loader.loadingEngine')} />}
      <LoadEngineWithScene injectedSystems={DefaultLocationSystems} />
      <OfflineLocation />
      <LocationIcons />
    </>
  )
}

export default LocationPage
