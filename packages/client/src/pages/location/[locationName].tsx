import React, { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useLocation, useRouteMatch } from 'react-router-dom'

import Layout from '@xrengine/client-core/src/components/Layout/Layout'
import { LoadingCircle } from '@xrengine/client-core/src/components/LoadingCircle'
import { LoadEngineWithScene } from '@xrengine/client-core/src/components/World/LoadEngineWithScene'
import LoadLocationScene from '@xrengine/client-core/src/components/World/LoadLocationScene'
import NetworkInstanceProvisioning from '@xrengine/client-core/src/components/World/NetworkInstanceProvisioning'
import OfflineLocation from '@xrengine/client-core/src/components/World/OfflineLocation'
import { LocationAction } from '@xrengine/client-core/src/social/services/LocationService'
import { useDispatch } from '@xrengine/client-core/src/store'
import { useEngineState } from '@xrengine/engine/src/ecs/classes/EngineService'

const LocationPage = () => {
  const { t } = useTranslation()
  const match = useRouteMatch()
  const { search } = useLocation()
  const dispatch = useDispatch()
  const engineState = useEngineState()
  const offline = new URLSearchParams(search).get('offline') === 'true'

  const params = match.params as any
  const locationName = params.locationName ?? `${params.projectName}/${params.sceneName}`

  useEffect(() => {
    dispatch(LocationAction.setLocationName(locationName))
  })

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
