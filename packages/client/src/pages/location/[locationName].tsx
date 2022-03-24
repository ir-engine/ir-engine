import React from 'react'
import { useTranslation } from 'react-i18next'
import { useRouteMatch } from 'react-router-dom'

import Layout from '@xrengine/client-core/src/components/Layout/Layout'
import { LoadingCircle } from '@xrengine/client-core/src/components/LoadingCircle'
import { LoadEngineWithScene } from '@xrengine/client-core/src/components/World/LoadEngineWithScene'
import LoadLocationScene from '@xrengine/client-core/src/components/World/LoadLocationScene'
import NetworkInstanceProvisioning from '@xrengine/client-core/src/components/World/NetworkInstanceProvisioning'
import { useEngineState } from '@xrengine/engine/src/ecs/classes/EngineService'

const LocationPage = () => {
  const { t } = useTranslation()
  const match = useRouteMatch()
  const params = match.params as any
  const locationName = params.locationName ?? `${params.projectName}/${params.sceneName}`
  const engineState = useEngineState()

  return (
    <Layout useLoadingScreenOpacity pageTitle={t('location.locationName.pageTitle')}>
      {engineState.isEngineInitialized.value ? <></> : <LoadingCircle />}
      <LoadEngineWithScene />
      <NetworkInstanceProvisioning locationName={locationName} />
      <LoadLocationScene locationName={params.locationName} />
    </Layout>
  )
}

export default LocationPage
