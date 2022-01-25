import React, { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import Layout from '@xrengine/client-core/src/components/Layout/Layout'
import { LoadEngineWithScene } from '@xrengine/client-core/src/components/World/LoadEngineWithScene'
import LoadLocationScene from '@xrengine/client-core/src/components/World/LoadLocationScene'
import NetworkInstanceProvisioning from '@xrengine/client-core/src/components/World/NetworkInstanceProvisioning'

interface Props {
  match?: any
}

const LocationPage = (props: Props) => {
  const { t } = useTranslation()
  const params = props?.match?.params!
  const locationName = params.locationName ?? `${params.projectName}/${params.sceneName}`

  return (
    <>
      <Layout pageTitle={t('location.locationName.pageTitle')}>
        <LoadEngineWithScene />
        <NetworkInstanceProvisioning locationName={locationName} />
        <LoadLocationScene locationName={props.match.params.locationName} />
      </Layout>
    </>
  )
}

export default LocationPage
