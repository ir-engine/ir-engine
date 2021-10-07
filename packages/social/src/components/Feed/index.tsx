/**
 * @author Tanya Vykliuk <tanya.vykliuk@gmail.com>
 */
import React, { useEffect } from 'react'
import { bindActionCreators, Dispatch } from 'redux'
import { connect, useDispatch } from 'react-redux'
import { useTranslation } from 'react-i18next'

import { Button, Typography } from '@material-ui/core'
import ArrowBackIosIcon from '@material-ui/icons/ArrowBackIos'

import { useFeedState } from '../../reducers/feed/FeedState'
import { FeedService } from '../../reducers/feed/FeedService'
import { selectPopupsState } from '../../reducers/popupsState/selector'
import { updateFeedPageState } from '../../reducers/popupsState/service'

import FeedCard from '../FeedCard'
import CommentList from '../CommentList'
import NewComment from '../NewComment'
import Featured from '../Featured'
import MoreHorizIcon from '@material-ui/icons/MoreHoriz'
import Popover from '@material-ui/core/Popover'

import styles from './Feed.module.scss'

const mapStateToProps = (state: any): any => {
  return {
    popupsState: selectPopupsState(state)
  }
}

const mapDispatchToProps = (dispatch: Dispatch): any => ({
  updateFeedPageState: bindActionCreators(updateFeedPageState, dispatch)
})

interface Props {
  feedId?: string
  popupsState?: any
  updateFeedPageState?: typeof updateFeedPageState
}
const Feed = ({ popupsState, updateFeedPageState }: Props) => {
  let feed = null as any
  const { t } = useTranslation()
  const dispatch = useDispatch()

  const feedsState = useFeedState()

  useEffect(() => {
    dispatch(FeedService.getFeed(popupsState.get('feedId')))
  }, [popupsState.get('feedId')])
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
    updateFeedPageState(false)
  }

  return (
    <section className={styles.feedContainer}>
      <section className={styles.controls}>
        <Button variant="text" className={styles.backButton} onClick={() => updateFeedPageState(false)}>
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

export default connect(mapStateToProps, mapDispatchToProps)(Feed)
