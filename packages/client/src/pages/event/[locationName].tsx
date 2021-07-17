import React from 'react'
import Scene from './event'
import Layout from './EventLayout'
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
