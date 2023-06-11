import { t } from 'i18next'
import React from 'react'
import { useParams } from 'react-router-dom'

import { LoadingCircle } from '@etherealengine/client-core/src/components/LoadingCircle'
import { LocationIcons } from '@etherealengine/client-core/src/components/LocationIcons'
import {
  useLoadLocation,
  useLoadLocationScene,
  useLoadScene
} from '@etherealengine/client-core/src/components/World/LoadLocationScene'
import { AuthService } from '@etherealengine/client-core/src/user/services/AuthService'
import { SceneService } from '@etherealengine/client-core/src/world/services/SceneService'
import { useDefaultLocationSystems } from '@etherealengine/client-core/src/world/useDefaultLocationSystems'
import { AppLoadingState } from '@etherealengine/engine/src/common/AppLoadingService'
import { getMutableState, useHookstate } from '@etherealengine/hyperflux'

import { useLoadEngineWithScene, useOfflineScene, useOnlineInstance } from '../components/World/EngineHooks'

type Props = {
  offline?: boolean
}

const LocationPage = ({ offline }: Props) => {
  const params = useParams()
  const appState = useHookstate(getMutableState(AppLoadingState).state)

  useLoadLocationScene()

  if (offline) {
    useOfflineScene()
  } else {
    useOnlineInstance()
  }

  if (params.locationName) {
    useLoadLocation({ locationName: params.locationName })
  } else {
    useLoadScene({ projectName: params.projectName!, sceneName: params.sceneName! })
  }

  AuthService.useAPIListeners()
  SceneService.useAPIListeners()

  useLoadEngineWithScene()
  useDefaultLocationSystems(!offline)

  return (
    <>
      {appState.value === 'START_STATE' && <LoadingCircle message={t('common:loader.loadingEngine')} />}
      <LocationIcons />
    </>
  )
}

export default LocationPage
