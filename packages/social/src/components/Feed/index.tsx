/**
 * @author Tanya Vykliuk <tanya.vykliuk@gmail.com>
 */
import React, { useEffect } from 'react'
import { useDispatch } from '@xrengine/client-core/src/store'
import { useTranslation } from 'react-i18next'

import { Button, Typography } from '@material-ui/core'
import ArrowBackIosIcon from '@material-ui/icons/ArrowBackIos'

import { useFeedState } from '@xrengine/client-core/src/social/services/FeedService'
import { FeedService } from '@xrengine/client-core/src/social/services/FeedService'

import FeedCard from '../FeedCard'
import Featured from '../Featured'
import MoreHorizIcon from '@material-ui/icons/MoreHoriz'
import Popover from '@material-ui/core/Popover'
import { useParams, useHistory } from 'react-router-dom'

import styles from './Feed.module.scss'
import './styles.module.scss'

const Feed = () => {
  let feed = null as any
  const { t } = useTranslation()
  const dispatch = useDispatch()
  const feedsState = useFeedState()
  const history = useHistory()

  const creator = feedsState?.feeds?.feed?.creator.value

  const { feedId } = useParams()
  useEffect(() => {
    FeedService.getFeed(feedId)
  }, [feedId])
  feed = feedsState.feeds.fetching.value === false && feedsState.feeds.feed

  useEffect(() => {
    if (creator) {
      FeedService.getFeeds('creator', creator.id)
    }
  }, [JSON.stringify(creator)])

  const [anchorEl, setAnchorEl] = React.useState<HTMLButtonElement | null>(null)
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(null)
  }
  const open = Boolean(anchorEl)
  const id = open ? 'simple-popover' : undefined

  const deleteAction = (feedId, previewId, videoId) => {
    FeedService.removeFeed(feedId, previewId, videoId)
    history.push('/')
  }

  return (
    <section className={styles.feedContainer}>
      <section className={styles.controls}>
        <Button variant="text" className={styles.backButton} onClick={() => history.push('/')}>
          <ArrowBackIosIcon />
          {t('social:feed.back')}
        </Button>

        <div className={styles.popover}>
          <Button aria-describedby={id} variant="contained" onClick={handleClick} tabIndex={0}>
            <MoreHorizIcon />
          </Button>
          <Popover
            id={id}
            open={open}
            anchorEl={anchorEl}
            onClose={handleClose}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'center'
            }}
            transformOrigin={{
              vertical: 'top',
              horizontal: 'center'
            }}
          >
            <Button
              variant="outlined"
              onClick={() => {
                deleteAction(feed.id.value, feed.previewId.value, feed.videoId.value)
              }}
            >
              Delete
            </Button>
          </Popover>
        </div>
      </section>
      {feed?.id?.value && <FeedCard feed={feed.value} />}
      {feed?.id?.value && (
        <>
          <Typography variant="h5">{t('social:feed.related')}</Typography>
          <Featured thisData={feedsState.feeds.feedsCreator.value} targetBody />
        </>
      )}
      {/*hided for now*/}
      {/* {feed && <CommentList feedId={feed.id} />}   */}
      {/* {feed && <NewComment feedId={feed.id} />}   */}
    </section>
  )
}

export default Feed
