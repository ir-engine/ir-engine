import React from 'react'
import Feed from '../../Feed'

//@ts-ignore
import styles from './FeedPopup.module.scss'
import { isIOS } from '@xrengine/client-core/src/util/platformCheck'
import AppFooter from '@xrengine/social/src/components/Footer'

export const FeedPopup = () => {
  const platformClass = isIOS ? styles.isIos : ''
  return (
    <div className={platformClass}>
      <div className={styles.feedPageIosWrapper}>
        <Feed />
        <AppFooter />
      </div>
    </div>
  )
}

export default FeedPopup
