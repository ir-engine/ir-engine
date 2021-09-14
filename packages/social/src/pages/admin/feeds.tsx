/**
 * @author Tanya Vykliuk <tanya.vykliuk@gmail.com>
 */
import React, { useEffect } from 'react'

import Dashboard from '@xrengine/social/src/components/Dashboard'
import { bindActionCreators, Dispatch } from 'redux'
import { connect } from 'react-redux'
import { selectFeedsState } from '@xrengine/social/src/reducers/feed/selector'
import { getFeeds } from '@xrengine/social/src/reducers/feed/service'

const mapStateToProps = (state: any): any => {
  return {
    feedsState: selectFeedsState(state)
  }
}

const mapDispatchToProps = (dispatch: Dispatch): any => ({
  getFeeds: bindActionCreators(getFeeds, dispatch)
})
interface Props {
  feedsState?: any
  getFeeds?: any
}

const FeedsPage = ({ feedsState, getFeeds }: Props) => {
  useEffect(() => getFeeds('admin'), [])
  const feedsList = feedsState && feedsState.get('fetching') === false ? feedsState.get('feedsAdmin') : null
  return (
    <>
      <div>
        <Dashboard>
          <div />
          {/* {feedsList && <FeedConsole list={feedsList} />} */}
        </Dashboard>
      </div>
    </>
  )
}

export default connect(mapStateToProps, mapDispatchToProps)(FeedsPage)
