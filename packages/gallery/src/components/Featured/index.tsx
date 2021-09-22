/**
 * @author Tanya Vykliuk <tanya.vykliuk@gmail.com>
 */
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { connect } from 'react-redux'
import { bindActionCreators, Dispatch } from 'redux'

import { Box, Button, TextField, Typography } from '@material-ui/core'
import Card from '@material-ui/core/Card'
import CardMedia from '@material-ui/core/CardMedia'
import VisibilityIcon from '@material-ui/icons/Visibility'

import { selectAuthState } from '@xrengine/client-core/src/user/reducers/auth/selector'
import { selectCreatorsState } from '../../reducers/creator/selector'
import { selectFeedsState } from '../../reducers/post/selector'
import { getFeeds, setFeedAsFeatured, setFeedNotFeatured } from '../../reducers/post/service'
import styles from './Featured.module.scss'

const mapStateToProps = (state: any): any => {
  return {
    feedsState: selectFeedsState(state),
    creatorState: selectCreatorsState(state),
    authState: selectAuthState(state)
  }
}

const mapDispatchToProps = (dispatch: Dispatch): any => ({
  getFeeds: bindActionCreators(getFeeds, dispatch),
  setFeedAsFeatured: bindActionCreators(setFeedAsFeatured, dispatch),
  setFeedNotFeatured: bindActionCreators(setFeedNotFeatured, dispatch)
})
interface Props {
  feedsState?: any
  authState?: any
  popupsState?: any
  getFeeds?: any
  type?: string
  creatorId?: string
  creatorState?: any
  setFeedAsFeatured?: typeof setFeedAsFeatured
  setFeedNotFeatured?: typeof setFeedNotFeatured
}

const Featured = ({
  feedsState,
  getFeeds,
  type,
  creatorId,
  popupsState,
  creatorState,
  setFeedAsFeatured,
  setFeedNotFeatured,
  authState
}: Props) => {
  const [feedsList, setFeedList] = useState([])
  const { t } = useTranslation()

  useEffect(() => {
    if (authState) {
      const user = authState.get('user')
      const userId = user ? user.id : null
      if (userId) {
        getFeeds('featured')
        if (feedsState.get('feedsFeatured')) {
          setFeedList(feedsState.get('feedsFeatured'))
        }
      }
    }
  }, [authState, feedsState.get('feedsFeatured')])

  return (
    <section className={styles.feedContainer}>
      {feedsList && feedsList.length > 0 ? (
        feedsList.map((item, itemIndex) => {
          const sizeIndex =
            itemIndex === 0 || itemIndex % 8 === 0 || itemIndex % 8 === 2 || itemIndex % 8 === 5
              ? 'listItem_width2'
              : itemIndex % 8 === 1
              ? 'listItem_width3'
              : 'listItem_width1'
          const topIndex = itemIndex % 8 === 2 ? 'listItem_top1' : itemIndex % 8 === 5 ? 'listItem_top2' : ''
          const width1_no_right_padding = itemIndex % 8 === 4 || itemIndex % 8 === 7 ? 'width1_no_right_padding' : ''
          return (
            <Card
              className={
                styles.creatorItem
                //  ' ' +
                //  styles[sizeIndex] +
                //  ' ' +
                //  styles[topIndex] +
                //  ' ' +
                //  styles[width1_no_right_padding]
              }
              elevation={0}
              key={itemIndex}
            >
              <CardMedia className={styles.previewImage} image={item.previewUrl} onClick={() => {}} />
              <span className={styles.descr}>{item.description}</span>

              <span className={styles.eyeLine}>
                {item.viewsCount}
                <VisibilityIcon style={{ fontSize: '16px' }} />
              </span>
            </Card>
          )
        })
      ) : (
        <Typography className={styles.emptyList}>{t('social:featured.empty-list')}</Typography>
      )}
    </section>
  )
}

export default connect(mapStateToProps, mapDispatchToProps)(Featured)
