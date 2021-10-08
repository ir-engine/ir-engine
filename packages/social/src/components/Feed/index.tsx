/**
 * @author Tanya Vykliuk <tanya.vykliuk@gmail.com>
 */
import React, { useEffect } from 'react'
import { connect, useDispatch } from 'react-redux'
import { useTranslation } from 'react-i18next'

import { Button, Typography } from '@material-ui/core'
import ArrowBackIosIcon from '@material-ui/icons/ArrowBackIos'

import { useFeedState } from '../../reducers/feed/FeedState'
import { FeedService } from '../../reducers/feed/FeedService'
import { usePopupsStateState } from '../../reducers/popupsState/PopupsStateState'
import { PopupsStateService } from '../../reducers/popupsState/PopupsStateService'

import FeedCard from '../FeedCard'
import Featured from '../Featured'
import MoreHorizIcon from '@material-ui/icons/MoreHoriz'
import Popover from '@material-ui/core/Popover'

import styles from './Feed.module.scss'

interface Props {
  feedId?: string
}
const Feed = (props: Props) => {
  let feed = null as any
  const { t } = useTranslation()
  const dispatch = useDispatch()
  const popupsState = usePopupsStateState()
  const feedsState = useFeedState()

  useEffect(() => {
    dispatch(FeedService.getFeed(popupsState.popups.feedId?.value))
  }, [popupsState.popups.feedId?.value])
  feed = feedsState.feeds.fetching.value === false && feedsState.feeds.feed

  const [anchorEl, setAnchorEl] = React.useState<HTMLButtonElement | null>(null)
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(null)
  }
  const open = Boolean(anchorEl)
  const id = open ? 'simple-popover' : undefined

  const deleteAction = (feedId, previewUrl, videoUrl) => {
    dispatch(FeedService.removeFeed(feedId, previewUrl, videoUrl))
    dispatch(PopupsStateService.updateFeedPageState(false))
  }

  return (
    <section className={styles.feedContainer}>
      <section className={styles.controls}>
        <Button
          variant="text"
          className={styles.backButton}
          onClick={() => {
            dispatch(PopupsStateService.updateFeedPageState(false))
          }}
        >
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
            <Button variant="outlined" onClick={() => deleteAction(feed.id, feed.previewUrl, feed.videoUrl)}>
              Delete
            </Button>
          </Popover>
        </div>
      </section>
      {feed && <FeedCard feed={feed} />}
      {feed && (
        <>
          <Typography variant="h5">{t('social:feed.related')}</Typography>
          <Featured type="creator" creatorId={feed.creator.id} />
        </>
      )}
      {/*hided for now*/}
      {/* {feed && <CommentList feedId={feed.id} />}   */}
      {/* {feed && <NewComment feedId={feed.id} />}   */}
    </section>
  )
}

export default Feed
