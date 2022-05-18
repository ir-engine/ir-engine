/**
 * @author Tanya Vykliuk <tanya.vykliuk@gmail.com>
 */
import Button from '@material-ui/core/Button'
import React, { useEffect, useState } from 'react'
import { useDispatch } from '@xrengine/client-core/src/store'

import { useCreatorState } from '@xrengine/client-core/src/social/services/CreatorService'
import { CreatorService } from '@xrengine/client-core/src/social/services/CreatorService'
import CreatorCard from '../CreatorCard'
import Featured from '../Featured'
import { useTranslation } from 'react-i18next'
import { FeedService } from '@xrengine/client-core/src/social/services/FeedService'
import { useFeedState } from '@xrengine/client-core/src/social/services/FeedService'

import styles from './Creator.module.scss'

interface Props {
  creatorId: string
}

const Creator = ({ creatorId }: Props) => {
  const [isMe, setIsMe] = useState(false)
  const dispatch = useDispatch()
  const creatorState = useCreatorState()
  const feedsState = useFeedState()
  useEffect(() => {
    if (
      creatorState.creators.fetchingCurrentCreator.value === false &&
      creatorState.creators.currentCreator.value &&
      creatorId === creatorState.creators.currentCreator?.id?.value
    ) {
      setIsMe(true)
    } else {
      setIsMe(false)
      CreatorService.getCreator(creatorId)
    }
  }, [creatorId])

  const { t } = useTranslation()
  const [videoType, setVideoType] = useState('creator')

  const myID =
    isMe === true ? creatorState?.creators?.currentCreator?.id?.value : creatorState?.creators?.creator?.id?.value
  useEffect(() => {
    FeedService.getFeeds(videoType, myID)
  }, [videoType, myID])
  return (
    <>
      <section id="wrapScroll2" className={styles.creatorContainer}>
        <CreatorCard
          creator={
            isMe === true ? creatorState?.creators.currentCreator?.id?.value : creatorState?.creators?.creator?.value
          }
        />
        {isMe && (
          <section className={styles.videosSwitcher}>
            <Button
              variant={videoType === 'creator' ? 'contained' : 'text'}
              className={styles.switchButton + (videoType === 'creator' ? ' ' + styles.active : '')}
              onClick={() => setVideoType('creator')}
            >
              {t('social:creator.myVideos')}
            </Button>
            <Button
              variant={videoType === 'fired' ? 'contained' : 'text'}
              className={styles.switchButton + (videoType === 'fired' ? ' ' + styles.active : '')}
              onClick={() => setVideoType('fired')}
            >
              {t('social:creator.savedVideos')}
            </Button>
          </section>
        )}
        <section className={styles.feedsWrapper}>
          <Featured thisData={feedsState.feeds.feedsCreator.value} containerId="wrapScroll2" />
        </section>
      </section>
    </>
  )
}

export default Creator
