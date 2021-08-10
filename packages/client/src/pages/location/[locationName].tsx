import React from 'react'
import World from '../../components/World'
import Layout from '../../components/Layout/Layout'
import { useTranslation } from 'react-i18next'
import { InteractableModal } from '../../../../client-core/src/world/components/InteractableModal'
import RecordingApp from '../../components/Recorder/RecordingApp'
import MediaIconsBox from '../../components/MediaIconsBox'
import UserMenu from '../../../../client-core/src/user/components/UserMenu'

const LocationPage = (props) => {
  const { t } = useTranslation()
  return (
    <Layout pageTitle={t('location.locationName.pageTitle')}>
      <World showDebug={true} locationName={props.match.params.locationName} history={props.history} >
        <InteractableModal />
        <RecordingApp />
        <MediaIconsBox />
        <UserMenu />
      </World>
    </Layout>
  )
}

export default LocationPage
