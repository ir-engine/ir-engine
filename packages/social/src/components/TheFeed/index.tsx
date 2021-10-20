/**
 * @author Tanya Vykliuk <tanya.vykliuk@gmail.com>
 */
import React, { useEffect } from 'react'
import { useDispatch } from '@xrengine/client-core/src/store'

import { TheFeedsService } from '@xrengine/client-core/src/social/state/TheFeedsService'
import { useTheFeedsState } from '@xrengine/client-core/src/social/state/TheFeedsState'

import TheFeedsCard from '../TheFeedsCard'

// @ts-ignore
import styles from './TheFeed.module.scss'

interface Props {}

const TheFeed = (props: Props) => {
  const dispatch = useDispatch()
  let feedsList = null
  useEffect(() => {
    TheFeedsService.getTheFeedsNew()
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
