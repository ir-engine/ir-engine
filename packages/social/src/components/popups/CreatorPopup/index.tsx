import React, { useEffect } from 'react'
import { useDispatch } from '@xrengine/client-core/src/store'
import { usePopupsStateState } from '@xrengine/client-core/src/social/state/PopupsStateService'
import { PopupsStateService } from '@xrengine/client-core/src/social/state/PopupsStateService'
import Creator from '../../Creator'
import SharedModal from '../../SharedModal'
import AppFooter from '../../Footer'

//@ts-ignore
import styles from './CreatorPopup.module.scss'

interface Props {
  webxrRecorderActivity: any
  setView?: any
}
export const CreatorPopup = ({ webxrRecorderActivity, setView }: Props) => {
  const popupsState = usePopupsStateState()
  const dispatch = useDispatch()

  const handleCreatorClose = () => {
    PopupsStateService.updateCreatorPageState(false)
  }
  const renderCreatorModal = () =>
    popupsState?.popups?.creatorPage?.value === true &&
    popupsState?.popups?.creatorId?.value &&
    !webxrRecorderActivity && (
      <SharedModal
        open={popupsState?.popups?.creatorPage?.value}
        onClose={handleCreatorClose}
        className={styles.creatorPopup}
      >
        <Creator creatorId={popupsState?.popups?.creatorId?.value} />
        <AppFooter setView={setView} />
      </SharedModal>
    )
  useEffect(() => {
    renderCreatorModal()
  }, [popupsState?.popups?.creatorPage?.value, popupsState?.popups?.creatorId?.value])
  return renderCreatorModal()
}

export default CreatorPopup
