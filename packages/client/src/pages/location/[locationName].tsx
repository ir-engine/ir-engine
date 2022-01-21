import React, { lazy, Suspense } from 'react'
import { useTranslation } from 'react-i18next'
import Layout from '../../components/Layout/Layout'
import { LoadEngineWithScene } from '../../components/World/LoadEngineWithScene'

const DefaultLayoutView = lazy(() => import('../../components/World/DefaultLayoutView'))
const LoadLocationScene = lazy(() => import('../../components/World/LoadLocationScene'))
const NetworkInstanceProvisioning = lazy(() => import('../../components/World/NetworkInstanceProvisioning'))
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
        <Suspense fallback={<></>}>
          <NetworkInstanceProvisioning locationName={locationName} />
          <LoadLocationScene locationName={props.match.params.locationName} />
          <DefaultLayoutView allowDebug={true} locationName={locationName} />
        </Suspense>
      </Layout>
    </>
  )
}

export default LocationPage
