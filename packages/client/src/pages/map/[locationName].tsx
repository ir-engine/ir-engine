import React from 'react'
import Scene from './map'
import Layout from './Layout'
import { useTranslation } from 'react-i18next'

const LocationPage = (props) => {
  const { t } = useTranslation()
  return (
    <Layout pageTitle={t('location.locationName.pageTitle')}>
      <Scene locationName={props.match.params.locationName} history={props.history} />
    </Layout>
  )
}

export default LocationPage
