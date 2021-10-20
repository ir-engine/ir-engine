import React, { useEffect } from 'react'
import { useDispatch } from '@standardcreative/client-core/src/store'
import { usePopupsStateState } from '@standardcreative/client-core/src/social/state/PopupsStateState'
import { PopupsStateService } from '@standardcreative/client-core/src/social/state/PopupsStateService'
import SharedModal from '../../SharedModal'
import AppFooter from '../../Footer'
import Feed from '../../Feed'

//@ts-ignore
import styles from './FeedPopup.module.scss'
import { isIOS } from '@standardcreative/client-core/src/util/platformCheck'

interface Props {
  webxrRecorderActivity: any
  setView?: any
}
export const FeedPopup = ({ webxrRecorderActivity, setView }: Props) => {
  const popupsState = usePopupsStateState()
  //common for feed page

  const platformClass = isIOS ? styles.isIos : ''
  const dispatch = useDispatch()

  const handleFeedClose = () => {
    PopupsStateService.updateFeedPageState(false)
  }
  const renderFeedModal = () =>
    popupsState?.popups?.feedPage?.value === true &&
    !webxrRecorderActivity && (
      <SharedModal
        open={popupsState?.popups?.feedPage?.value}
        onClose={handleFeedClose}
        className={styles.feedPagePopup + ' ' + platformClass}
      >
        <div className={styles.feedPageIosWrapper}>
          <Feed />
          <AppFooter setView={setView} />
        </div>
      </SharedModal>
    )
  useEffect(() => {
    renderFeedModal()
  }, [popupsState?.popups?.feedPage?.value, popupsState?.popups?.feedId?.value])
  return renderFeedModal()
}

export default FeedPopup
