import React from 'react'

import AppFooter from '@xrengine/social/src/components/Footer'
import FeedForm from '@xrengine/social/src/components/FeedForm'
import AppHeader from '@xrengine/social/src/components/Header'

// @ts-ignore
import styles from './index.module.scss'

export default function NewFeedPage() {
  return (
    <div className={styles.viewport}>
      <AppHeader />
      <FeedForm />
      <AppFooter />
    </div>
  )
}
