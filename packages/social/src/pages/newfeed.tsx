import React from 'react'

import AppFooter from '@xrengine/client-core/src/socialmedia/components/Footer'
import FeedForm from '@xrengine/client-core/src/socialmedia/components/FeedForm'
import AppHeader from '@xrengine/client-core/src/socialmedia/components/Header'

import styles from './index.module.scss'

export default function NewFeedPage() {
  return (
    <div className={styles.viewport}>
      <AppHeader logo="/assets/logoBlack.png" />
      <FeedForm />
      <AppFooter />
    </div>
  )
}
