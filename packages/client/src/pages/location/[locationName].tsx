import React, { useEffect, useState } from 'react'
import Layout from '../../components/Layout/Layout'
import DefaultLayoutView from '../../components/World/DefaultLayoutView'
import { LoadEngineWithScene } from '../../components/World/LoadEngineWithScene'
import { LoadLocationScene } from '../../components/World/LoadLocationScene'
import NetworkInstanceProvisioning from '../../components/World/NetworkInstanceProvisioning'
import { useTranslation } from 'react-i18next'

interface Props {
  match?: any
}

const LocationPage = (props: Props) => {
  const { t } = useTranslation()
  const [isValidLocation, setIsValidLocation] = useState(true)
  const [harmonyOpen, setHarmonyOpen] = useState(false)
  const [reinit, reinitEngine] = useState(false)
  const locationName = props?.match?.params?.locationName

  const engineInit = () => {
    reinitEngine(!reinit)
  }

  return (
    <>
      <NetworkInstanceProvisioning locationName={locationName} setIsValidLocation={setIsValidLocation} />
      <LoadLocationScene locationName={props.match.params.locationName} />
      <LoadEngineWithScene />
      <Layout
        pageTitle={t('location.locationName.pageTitle')}
        harmonyOpen={harmonyOpen}
        setHarmonyOpen={setHarmonyOpen}
      >
        <DefaultLayoutView
          isValidLocation={isValidLocation}
          allowDebug={true}
          reinit={engineInit}
          locationName={locationName}
        />
      </Layout>
    </>
  )
}

export default LocationPage
