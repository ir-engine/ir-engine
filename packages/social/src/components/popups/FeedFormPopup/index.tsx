import React, { useEffect } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators, Dispatch } from 'redux'
import { selectPopupsState } from '../../../reducers/popupsState/selector'
import { updateNewFeedPageState } from '../../../reducers/popupsState/service'
import FeedForm from '../../FeedForm'

const mapStateToProps = (state: any): any => {
  return {
    popupsState: selectPopupsState(state)
  }
}

const mapDispatchToProps = (dispatch: Dispatch): any => ({
  updateNewFeedPageState: bindActionCreators(updateNewFeedPageState, dispatch)
})

interface Props {
  popupsState?: any
  updateNewFeedPageState?: typeof updateNewFeedPageState
}
export const FeedFormPopup = ({ popupsState, updateNewFeedPageState }: Props) => {
  //common for new feed page
  const handleNewFeedClose = () => {
    updateNewFeedPageState(false)
  }

  const renderNewFeedModal = () =>
    popupsState?.get('shareFeedPage') === true && (
      // <SharedModal
      //     open={popupsState?.get('shareFeedPage')}
      //     onClose={handleNewFeedClose}
      //     className={styles.feedFormPopup}
      // >

      <FeedForm />
    )
  // <AppFooter />
  //  </SharedModal>;
  const newFeedPageState = popupsState?.get('shareFeedPage')
  useEffect(() => {
    renderNewFeedModal()
  }, [newFeedPageState])
  return renderNewFeedModal()
}

export default connect(mapStateToProps, mapDispatchToProps)(FeedFormPopup)
