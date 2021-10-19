import React, { useEffect, useState, useCallback, ElementType } from 'react'

import { useDispatch } from '@xrengine/client-core/src/store'
import { useTranslation } from 'react-i18next'
import { Button, Card, Typography, CardContent, CardMedia, CardHeader, Grid } from '@material-ui/core'
import { useFeedState } from '@xrengine/client-core/src/social/state/FeedState'
import { FeedService } from '@xrengine/client-core/src/social/state/FeedService'
import { Document, Page, pdfjs } from 'react-pdf'
import Pagination from '@mui/material/Pagination'
import HighlightOffIcon from '@material-ui/icons/HighlightOff'

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`

import styles from './Feed.module.scss'
import { Container, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Stack } from '@mui/material'
import { useHistory } from 'react-router'
import { useAuthState } from '@xrengine/client-core/src/user/state/AuthState'
import { useCreatorState } from '@xrengine/client-core/src/social/state/CreatorState'
import { MediaContent } from '../Featured/MediaContent'

export const getComponentTypeForMedia = (mime) => {
  switch (true) {
    case mime.startsWith('image'):
      return 'img'
    case mime.startsWith('video'):
      return 'video'
    case mime.startsWith('audio'):
      return 'audio'
    case mime === 'application/pdf':
      return 'pdf'
    default:
      return 'img'
  }
}

interface Props {
  feedId?: string
}
const Feed = ({ feedId }: Props) => {
  let feed = null as any
  const dispatch = useDispatch()
  const { t } = useTranslation()
  const [numPages, setNumPages] = useState(null)
  const [pageNumber, setPageNumber] = useState(1)
  const feedsState = useFeedState()
  const [open, setOpen] = useState(false)
  const history = useHistory()
  const auth = useAuthState()
  const creatorState = useCreatorState()
  function onDocumentLoadSuccess({ numPages }) {
    setNumPages(numPages)
  }

  const handleChangePage = (e, page) => {
    setPageNumber(typeof page === 'number' ? page : pageNumber)
  }

  const handleDeleteClick = () => setOpen(true)
  const handleClose = () => setOpen(false)
  const handleOk = () => {
    FeedService.removeFeed(feedId, feed.previewUrl, feed.videoUrl)
    setOpen(false)
    history.goBack()
  }
  const Hashtag = ({ hashtag }) => {
    return (
      <a
        className={styles.hashtag}
        onClick={() =>
          history.push({
            pathname: '/',
            search: `tag=all&hashtag=${hashtag}`
          })
        }
      >
        #{hashtag}
      </a>
    )
  }

  const hashtagsToLinks = (str): Array<any> => {
    const r = /(#[a-zA-Z0-9]+)/g
    const result = str.split(r).map((sub) => {
      if (r.test(sub)) {
        return <Hashtag hashtag={sub.substring(1)} />
      } else {
        return sub
      }
    })
    return result
  }

  useEffect(() => {
    FeedService.getFeed(feedId)
  }, [])

  feed = feedsState.feeds.fetching.value === false && feedsState.feeds.feed.value
  const userAsCreatorId = creatorState.creators.currentCreator.id.value
  const isMyFeed = auth.user.id.value && userAsCreatorId && userAsCreatorId === feed?.creator?.id
  hashtagsToLinks(feed.description || '')
  const componentType = getComponentTypeForMedia(feed.previewType || 'image')
  return (
    <section className={styles.feedContainer}>
      {feed && (
        <Grid item className={styles.gridItem}>
          <div className={styles.squareCard}>
            <Card
              className={styles.creatorItem}
              elevation={0}
              style={{
                flexDirection: 'column',
                justifyContent: 'space-between',
                alignItems: 'center',
                display: 'flex'
              }}
            >
              {isMyFeed && (
                <CardHeader
                  className={styles.cardHeader}
                  action={<HighlightOffIcon onClick={handleDeleteClick} className={styles.deleteIcon} />}
                ></CardHeader>
              )}
              <div className={styles.imageWrapper}>
                <MediaContent className={styles.image} item={feed} history={history} full />
              </div>
              <CardContent style={{ marginRight: 'auto', paddingLeft: 20 }}>
                <Typography className={styles.cartText} variant="h6">
                  {feed.title}
                </Typography>
                <Typography className={styles.cartDescription} variant="h6">
                  {hashtagsToLinks(feed.description || '').map((item, key) => (
                    <span key={key}>{item}</span>
                  ))}
                </Typography>
              </CardContent>
            </Card>
          </div>
        </Grid>
      )}
      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">{'Delete feed'}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Are you sure you want to delete this feed?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleOk} autoFocus>
            Ok
          </Button>
        </DialogActions>
      </Dialog>
    </section>
  )
}

export default Feed
