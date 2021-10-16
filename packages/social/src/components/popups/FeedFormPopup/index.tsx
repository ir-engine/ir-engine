import React, { useEffect } from 'react'
import { useDispatch } from '@xrengine/client-core/src/store'
import { usePopupsStateState } from '@xrengine/client-core/src/social/state/PopupsStateState'
import { PopupsStateService } from '@xrengine/client-core/src/social/state/PopupsStateService'
import FeedForm from '../../FeedForm'

interface Props {
  setView?: any
}
export const FeedFormPopup = ({ setView }: Props) => {
  const dispatch = useDispatch()
  const popupsState = usePopupsStateState()
  //common for new feed page
  const handleNewFeedClose = () => {
    PopupsStateService.updateNewFeedPageState(false)
  }

  const renderNewFeedModal = () =>
    popupsState.popups.shareFeedPage?.value === true && (
      // <SharedModal
      //     open={popupsState?.get('shareFeedPage')}
      //     onClose={handleNewFeedClose}
      //     className={styles.feedFormPopup}
      // >

      <FeedForm />
    )
  // <AppFooter />
  //  </SharedModal>;

  useEffect(() => {
    renderNewFeedModal()
  }, [popupsState.popups.shareFeedPage.value])
  return renderNewFeedModal()
}

export default FeedFormPopup
