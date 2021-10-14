/**
 * @author Tanya Vykliuk <tanya.vykliuk@gmail.com>
 */
import React, { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import Dashboard from '@xrengine/social/src/components/Dashboard'
import { useFeedState } from '@xrengine/client-core/src/social/reducers/feed/FeedState'
import { FeedService } from '@xrengine/client-core/src/social/reducers/feed/FeedService'

const FeedsPage = () => {
  const dispatch = useDispatch()
  useEffect(() => {
    dispatch(FeedService.getFeeds('admin'))
  }, [])
  const feedState = useFeedState()
  const feedsList = feedState && feedState.feeds.fetching.value === false ? feedState.feeds.feedsAdmin : null
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
