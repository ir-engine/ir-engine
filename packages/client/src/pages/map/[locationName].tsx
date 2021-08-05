import React from 'react'
import Scene from './map'
import Layout from './Layout'
import { useTranslation } from 'react-i18next'
import JoinParty from './blockparty/JoinParty'

const LocationPage = (props) => {
  const { t } = useTranslation()
  return (
    <JoinParty/>
    // <Layout pageTitle={t('location.locationName.pageTitle')}>
    //   <Scene locationName={props.match.params.locationName} history={props.history} />
    // </Layout>
  )
}

export default LocationPage
