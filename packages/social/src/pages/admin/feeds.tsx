/**
 * @author Tanya Vykliuk <tanya.vykliuk@gmail.com>
 */
import React, { useEffect } from 'react'

import Dashboard from '@xrengine/social/src/components/Dashboard'
import { FeedService } from '@xrengine/client-core/src/social/state/FeedService'

const FeedsPage = () => {
  useEffect(() => {
    FeedService.getFeeds('admin')
  }, [])
  //const feedState = useFeedState()
  //const feedsList = feedState && feedState.feeds.fetching.value === false ? feedState.feeds.feedsAdmin : null
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

export default FeedsPage
