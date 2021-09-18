import Feed from '../components/Feed'
import React from 'react'
import { useLocation } from 'react-router-dom'
import styles from './index.module.scss'

export default function FeedPage() {
  const feedId = new URLSearchParams(useLocation().search).get('postId')

  return <div className={styles.viewport}>{feedId && <Feed feedId={feedId} />}</div>
}
