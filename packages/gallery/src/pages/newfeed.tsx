import React from 'react'

import AppFooter from '@xrengine/client-core/src/socialmedia/components/Footer'
import FeedForm from '@xrengine/client-core/src/socialmedia/components/FeedForm'

import styles from './index.module.scss'

export default function NewFeedPage() {
  return (
    <div className={styles.viewport}>
      <FeedForm />
      <AppFooter />
    </div>
  )
}
