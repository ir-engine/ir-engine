/**
 * @author Tanya Vykliuk <tanya.vykliuk@gmail.com>
 */
import React, { useEffect } from 'react'
import { useDispatch } from '@standardcreative/client-core/src/store'
import Dashboard from '@standardcreative/social/src/components/Dashboard'
import { useFeedState } from '@standardcreative/client-core/src/social/state/FeedState'
import { FeedService } from '@standardcreative/client-core/src/social/state/FeedService'

const FeedsPage = () => {
  const dispatch = useDispatch()
  useEffect(() => {
    FeedService.getFeeds('admin')
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
