import React, { useEffect } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators, Dispatch } from 'redux'
import { selectPopupsState } from '../../../reducers/popupsState/selector'
import { updateFeedPageState } from '../../../reducers/popupsState/service'
import SharedModal from '../../SharedModal'
import AppFooter from '../../Footer'
import Feed from '../../Feed'

//@ts-ignore
import styles from './FeedPopup.module.scss'
import { isIOS } from '@xrengine/client-core/src/util/platformCheck'

const mapStateToProps = (state: any): any => {
  return {
    popupsState: selectPopupsState(state)
  }
}

const mapDispatchToProps = (dispatch: Dispatch): any => ({
  updateFeedPageState: bindActionCreators(updateFeedPageState, dispatch)
})

interface Props {
  popupsState?: any
  updateFeedPageState?: typeof updateFeedPageState
  webxrRecorderActivity: any
  setView?: any
}
export const FeedPopup = ({ popupsState, updateFeedPageState, webxrRecorderActivity, setView }: Props) => {
  //common for feed page
  const feedPageState = popupsState?.get('feedPage')
  const feedId = popupsState?.get('feedId')
  const platformClass = isIOS ? styles.isIos : ''

  const handleFeedClose = () => updateFeedPageState(false)
  const renderFeedModal = () =>
    popupsState?.get('feedPage') === true &&
    !webxrRecorderActivity && (
      <SharedModal
        open={popupsState?.get('feedPage')}
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
  }, [feedPageState, feedId])
  return renderFeedModal()
}

export default connect(mapStateToProps, mapDispatchToProps)(FeedPopup)
