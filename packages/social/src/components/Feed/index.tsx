/**
 * @author Tanya Vykliuk <tanya.vykliuk@gmail.com>
 */
import React, { useEffect } from 'react'
import { bindActionCreators, Dispatch } from 'redux'
import { connect } from 'react-redux'
import { useTranslation } from 'react-i18next'

import { Button, Typography } from '@material-ui/core'
import ArrowBackIosIcon from '@material-ui/icons/ArrowBackIos'

import { selectFeedsState } from '../../reducers/feed/selector'
import { getFeed, removeFeed } from '../../reducers/feed/service'
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
    feedsState: selectFeedsState(state),
    popupsState: selectPopupsState(state)
  }
}

const mapDispatchToProps = (dispatch: Dispatch): any => ({
  getFeed: bindActionCreators(getFeed, dispatch),
  updateFeedPageState: bindActionCreators(updateFeedPageState, dispatch),
  removeFeed: bindActionCreators(removeFeed, dispatch)
})

interface Props {
  feedsState?: any
  getFeed?: any
  feedId?: string
  popupsState?: any
  updateFeedPageState?: typeof updateFeedPageState
  removeFeed?: any
}
const Feed = ({ feedsState, getFeed, popupsState, updateFeedPageState, removeFeed }: Props) => {
  let feed = null as any
  const { t } = useTranslation()
  useEffect(() => getFeed(popupsState.get('feedId')), [popupsState.get('feedId')])
  feed = feedsState && feedsState.get('fetching') === false && feedsState.get('feed')

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
    removeFeed(feedId, previewUrl, videoUrl)
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
          {/* @ts-ignore */}
          <div aria-describedby={id} variant="contained" onClick={handleClick}>
            <MoreHorizIcon />
          </div>
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
