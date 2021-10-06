import React, { useEffect, useState, useCallback, ElementType } from 'react'
import { bindActionCreators, Dispatch } from 'redux'
import { connect } from 'react-redux'
import { useTranslation } from 'react-i18next'
import { Button, Card, Typography, CardContent, CardMedia } from '@material-ui/core'
import { selectFeedsState } from '../../reducers/post/selector'
import { getFeed } from '../../reducers/post/service'
import { Document, Page, pdfjs } from 'react-pdf'
import Pagination from '@mui/material/Pagination'

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`

import styles from './Feed.module.scss'
import { Container, Stack } from '@mui/material'

const mapStateToProps = (state: any): any => {
  return {
    feedsState: selectFeedsState(state)
  }
}

const mapDispatchToProps = (dispatch: Dispatch): any => ({
  getFeed: bindActionCreators(getFeed, dispatch)
})

export const getComponentTypeForMedia = (mime) => {
  switch (true) {
    case mime.startsWith('image'):
      return 'img'
      break
    case mime.startsWith('video'):
      return 'video'
      break
    case mime.startsWith('audio'):
      return 'audio'
      break
    case mime === 'application/pdf':
      return 'pdf'
      break
    default:
      return 'img'
      break
  }
}

interface Props {
  feedsState?: any
  getFeed?: any
  feedId?: string
}
const Feed = ({ feedsState, getFeed, feedId }: Props) => {
  let feed = null as any
  const { t } = useTranslation()
  const [numPages, setNumPages] = useState(null)
  const [pageNumber, setPageNumber] = useState(1)

  function onDocumentLoadSuccess({ numPages }) {
    setNumPages(numPages)
  }

  const handleChangePage = (e, page) => {
    setPageNumber(typeof page === 'number' ? page : pageNumber)
  }

  useEffect(() => getFeed(feedId), [])
  feed = feedsState && feedsState.get('fetching') === false && feedsState.get('feed')

  const componentType = getComponentTypeForMedia(feed.previewType || 'image')
  return (
    <section className={styles.feedContainer}>
      {feed && (
        <Card className={styles.card}>
          {componentType !== 'pdf' ? (
            <CardMedia
              component={componentType === 'audio' ? 'audio' : 'img'}
              src={feed.previewUrl}
              alt={feed.title}
              className={styles.previewImage}
              controls
            />
          ) : (
            <Container>
              <Stack spacing={1}>
                <Pagination page={pageNumber} count={numPages} onChange={handleChangePage} />
                <p>
                  Page {pageNumber} of {numPages}
                </p>
              </Stack>
              <Document file={feed.previewUrl} onLoadError={console.error} onLoadSuccess={onDocumentLoadSuccess}>
                <Page pageNumber={pageNumber} />
              </Document>
              <Stack spacing={1}>
                <p>
                  Page {pageNumber} of {numPages}
                </p>
                <Pagination page={pageNumber} count={numPages} onChange={handleChangePage} />
              </Stack>
            </Container>
          )}
          <CardContent>
            <Typography className={styles.cartText} variant="h6">
              {feed.title}
            </Typography>
            <Typography className={styles.cartDescription} variant="h6">
              {feed.description}
            </Typography>
          </CardContent>
        </Card>
      )}
    </section>
  )
}

export default connect(mapStateToProps, mapDispatchToProps)(Feed)
