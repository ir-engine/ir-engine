/**
 * @author Tanya Vykliuk <tanya.vykliuk@gmail.com>
 */
import React, { useEffect } from 'react'
import { connect, useDispatch } from 'react-redux'
import { bindActionCreators, Dispatch } from 'redux'
// import { selectFeedsState } from '../../reducers/feed/selector';
// import { getFeeds } from '../../reducers/feed/service';
import { TheFeedsService } from '@xrengine/social/src/reducers/thefeeds/TheFeedsService'
import { useTheFeedsState } from '@xrengine/social/src/reducers/thefeeds/TheFeedsState'

import TheFeedsCard from '../TheFeedsCard'

// @ts-ignore
import styles from './TheFeed.module.scss'
import { useFeedState } from '../../reducers/feed/FeedState'

interface Props {}

const TheFeed = (props: Props) => {
  const dispatch = useDispatch()
  let feedsList = null
  useEffect(() => {
    dispatch(TheFeedsService.getTheFeedsNew())
  }, [])
  const theFeedsState = useTheFeedsState()

  const TheFeedsList = theFeedsState?.thefeeds?.value || []
  //     useEffect(()=> console.log(TheFeedsList), [TheFeedsList]);
  return (
    <section className={styles.thefeedContainer}>
      {TheFeedsList && TheFeedsList.length > 0 ? (
        TheFeedsList.map((item, key) => <TheFeedsCard key={key} feed={item} />)
      ) : (
        <p className={styles.noContent}>Coming soon...</p>
      )}
    </section>
  )
}

export default TheFeed
