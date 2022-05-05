import React, { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useRouteMatch } from 'react-router-dom'

import Layout from '@xrengine/client-core/src/components/Layout'
import { LoadingCircle } from '@xrengine/client-core/src/components/LoadingCircle'
import { LoadEngineWithScene } from '@xrengine/client-core/src/components/World/LoadEngineWithScene'
import OfflineLocation from '@xrengine/client-core/src/components/World/OfflineLocation'
import { LocationAction } from '@xrengine/client-core/src/social/services/LocationService'
import { useDispatch } from '@xrengine/client-core/src/store'
import { useEngineState } from '@xrengine/engine/src/ecs/classes/EngineService'

import { loadSceneJsonOffline } from './utils'

const LocationPage = () => {
  const { t } = useTranslation()
  const match = useRouteMatch()
  const dispatch = useDispatch()
  const engineState = useEngineState()

  const params = match.params as any

  useEffect(() => {
    dispatch(LocationAction.setLocationName(`${params.projectName}/${params.sceneName}`))
    loadSceneJsonOffline(params.projectName, params.sceneName)
  }, [])

  return (
    <Layout useLoadingScreenOpacity pageTitle={t('location.locationName.pageTitle')}>
      {engineState.isEngineInitialized.value ? <></> : <LoadingCircle />}
      <LoadEngineWithScene />
      <OfflineLocation />
    </Layout>
  )
}

export default LocationPage
