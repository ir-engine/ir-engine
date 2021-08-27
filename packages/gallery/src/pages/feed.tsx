import Feed from '@xrengine/client-core/src/socialmedia/components/Feed'
import React from 'react'
import { useLocation } from 'react-router-dom'
import styles from './index.module.scss'

export default function FeedPage() {
  const feedId = new URLSearchParams(useLocation().search).get('feedId').toString()
  return (
    <div className={styles.viewport}>
      <Feed feedId={feedId} />
    </div>
  )
}
