import React from 'react'
import Scene from '../../components/Scene/event'
import Layout from '../../components/Layout/EventLayout'
import { useTranslation } from 'react-i18next'

const LocationPage = (props) => {
  const { t } = useTranslation()

  return (
    <Layout pageTitle={t('location.locationName.pageTitle')}>
      <Scene locationName={props.match.params.locationName} enableSharing={false} history={props.history} />
    </Layout>
  )
}

export default LocationPage
