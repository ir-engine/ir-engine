import React from 'react'
import World from '../../components/World/index'
import { useTranslation } from 'react-i18next'
import Layout from '../../components/Layout/Layout'

const LocationPage = (props) => {
  const { t } = useTranslation()

  return (
    <Layout pageTitle={t('location.locationName.pageTitle')}>
      <World
        allowDebug={true}
        locationName={props.match.params.locationName}
        history={props.history}
        showTouchpad
      ></World>
    </Layout>
  )
}

export default LocationPage
