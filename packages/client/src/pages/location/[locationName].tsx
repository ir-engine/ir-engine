import React from 'react'
import { useTranslation } from 'react-i18next'
import Layout from '@xrengine/client-core/src/components/Layout/Layout'
import { LoadEngineWithScene } from '@xrengine/client-core/src/components/World/LoadEngineWithScene'
import LoadLocationScene from '@xrengine/client-core/src/components/World/LoadLocationScene'
import NetworkInstanceProvisioning from '@xrengine/client-core/src/components/World/NetworkInstanceProvisioning'
import { useEngineState } from '@xrengine/engine/src/ecs/classes/EngineService'
import { LoadingCircle } from '@xrengine/client-core/src/components/LoadingCircle'

interface Props {
  match?: any
}

const LocationPage = (props: Props) => {
  const { t } = useTranslation()
  const params = props?.match?.params!
  const locationName = params.locationName ?? `${params.projectName}/${params.sceneName}`
  const engineState = useEngineState()

  return (
    <Layout useLoadingScreenOpacity pageTitle={t('location.locationName.pageTitle')}>
      {engineState.isEngineInitialized.value || <LoadingCircle />}
      <LoadEngineWithScene />
      <NetworkInstanceProvisioning locationName={locationName} />
      <LoadLocationScene locationName={props.match.params.locationName} />
    </Layout>
  )
}

export default LocationPage
