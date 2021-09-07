import React from 'react'

import AppFooter from '@xrengine/social/src/components/Footer'
import FeedForm from '@xrengine/social/src/components/FeedForm'

import styles from './index.module.scss'

export default function NewFeedPage() {
  return (
    <div className={styles.viewport}>
      <FeedForm />
      <AppFooter />
    </div>
  )
}
