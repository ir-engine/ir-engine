import React, { useEffect, useState } from 'react'
import Layout from '../../components/Layout/Layout'
import DefaultLayoutView from '../../components/World/DefaultLayoutView'
import World from '../../components/World/index'
import NetworkInstanceProvisioning from '../../components/World/NetworkInstanceProvisioning'
import { useTranslation } from 'react-i18next'

interface Props {
  locationName: string
  allowDebug?: boolean
  history?: any
  showTouchpad?: boolean
  children?: any
  // todo: remove these props in favour of projects
  theme?: any
  hideVideo?: boolean
  hideFullscreen?: boolean
}

const LocationPage = (props: Props) => {
  const { t } = useTranslation()
  const [sceneId, setSceneId] = useState('')
  const [isUserBanned, setIsUserBanned] = useState(true)
  const [isValidLocation, setIsValidLocation] = useState(true)
  const [harmonyOpen, setHarmonyOpen] = useState(false)
  const [loadingItemCount, setLoadingItemCount] = useState(99)
  const [isTeleporting, setIsTeleporting] = useState(false)
  const [reinit, reinitEngine] = useState(false)

  const engineInit = () => {
    reinitEngine(!reinit)
  }

  return (
    <>
      <NetworkInstanceProvisioning
        locationName={props.locationName}
        sceneId={sceneId}
        isUserBanned={isUserBanned}
        setIsValidLocation={setIsValidLocation}
      />
      <World
        locationName={props.locationName}
        history={props.history}
        setSceneId={setSceneId}
        setUserBanned={setIsUserBanned}
        setLoadingItemCount={setLoadingItemCount}
        setIsTeleporting={setIsTeleporting}
        reinit={reinit}
      />
      <Layout
        pageTitle={t('location.locationName.pageTitle')}
        harmonyOpen={harmonyOpen}
        setHarmonyOpen={setHarmonyOpen}
        theme={props.theme}
        hideVideo={props.hideVideo}
        hideFullscreen={props.hideFullscreen}
      >
        <DefaultLayoutView
          loadingItemCount={loadingItemCount}
          isValidLocation={isValidLocation}
          allowDebug={true}
          reinit={engineInit}
          children={props.children}
          showTouchpad={props.showTouchpad}
          isTeleporting={isTeleporting}
          locationName={props.locationName}
        />
      </Layout>
    </>
  )
}

export default LocationPage
