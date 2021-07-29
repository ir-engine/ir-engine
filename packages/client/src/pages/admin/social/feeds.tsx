import React, { useEffect } from 'react'
import { bindActionCreators, Dispatch } from 'redux'
import { connect } from 'react-redux'
import { selectFeedsState } from '@xrengine/client-core/src/socialmedia/reducers/feed/selector'
import { getFeeds } from '@xrengine/client-core/src/socialmedia/reducers/feed/service'
import Feed from '@xrengine/client-core/src/admin/components/Social/Feed'

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

/**
 * @author KIMENYI Kevin <kimenyikevin@gmail.com>
 */
const FeedsPage = ({ feedsState, getFeeds }: Props) => {
  useEffect(() => getFeeds('admin'), [])
  const feedsList =
    feedsState.get('fetching') === false && feedsState?.get('feedsAdmin') ? feedsState.get('feedsAdmin') : null
  return (
    <>
      <div>
        {/* <Dashboard> */}
        <Feed />
        {/* {feedsList && <FeedConsole list={feedsList} />} */}
        {/* </Dashboard> */}
      </div>
    </>
  )
}

export default connect(mapStateToProps, mapDispatchToProps)(FeedsPage)
