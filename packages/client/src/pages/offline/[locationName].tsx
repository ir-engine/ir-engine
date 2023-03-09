import React, { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useParams } from 'react-router-dom'

import { AppLoadingState } from '@etherealengine/client-core/src/common/services/AppLoadingService'
import { LoadingCircle } from '@etherealengine/client-core/src/components/LoadingCircle'
import { LocationIcons } from '@etherealengine/client-core/src/components/LocationIcons'
import { LoadEngineWithScene } from '@etherealengine/client-core/src/components/World/LoadEngineWithScene'
import { OfflineLocation } from '@etherealengine/client-core/src/components/World/OfflineLocation'
import { LocationAction } from '@etherealengine/client-core/src/social/services/LocationService'
import { DefaultLocationSystems } from '@etherealengine/client-core/src/world/DefaultLocationSystems'
import { useEngineState } from '@etherealengine/engine/src/ecs/classes/EngineState'
import { dispatchAction, getMutableState, useHookstate } from '@etherealengine/hyperflux'

import { loadSceneJsonOffline } from './utils'

const LocationPage = () => {
  const { t } = useTranslation()
  const params = useParams()
  const appState = useHookstate(getMutableState(AppLoadingState).state)

  useEffect(() => {
    dispatchAction(LocationAction.setLocationName({ locationName: `${params.projectName}/${params.sceneName}` }))
    loadSceneJsonOffline(params.projectName, params.sceneName)
  }, [])

  return (
    <>
      {appState.value === 'START_STATE' ? <LoadingCircle message={t('common:loader.loadingEngine')} /> : <></>}
      <LoadEngineWithScene injectedSystems={DefaultLocationSystems} />
      <OfflineLocation />
      <LocationIcons />
    </>
  )
}

export default LocationPage
