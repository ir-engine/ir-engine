/**
 * @author Tanya Vykliuk <tanya.vykliuk@gmail.com>
 */
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { connect } from 'react-redux'
import { bindActionCreators, Dispatch } from 'redux'

import { Typography } from '@material-ui/core'
import Card from '@material-ui/core/Card'
import CardMedia from '@material-ui/core/CardMedia'
import VisibilityIcon from '@material-ui/icons/Visibility'

import { selectAuthState } from '../../../user/reducers/auth/selector'
import { selectCreatorsState } from '../../reducers/creator/selector'
import { selectFeedsState } from '../../reducers/feed/selector'
import { getFeeds, setFeedAsFeatured, setFeedNotFeatured } from '../../reducers/feed/service'
import { selectPopupsState } from '../../reducers/popupsState/selector'
import { updateFeedPageState } from '../../reducers/popupsState/service'
import styles from './Featured.module.scss'

const mapStateToProps = (state: any): any => {
  return {
    feedsState: selectFeedsState(state),
    creatorState: selectCreatorsState(state),
    authState: selectAuthState(state),
    popupsState: selectPopupsState(state)
  }
}

const mapDispatchToProps = (dispatch: Dispatch): any => ({
  getFeeds: bindActionCreators(getFeeds, dispatch),
  setFeedAsFeatured: bindActionCreators(setFeedAsFeatured, dispatch),
  setFeedNotFeatured: bindActionCreators(setFeedNotFeatured, dispatch),
  updateFeedPageState: bindActionCreators(updateFeedPageState, dispatch)
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
  updateFeedPageState?: typeof updateFeedPageState
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
  authState,
  updateFeedPageState
}: Props) => {
  const [feedsList, setFeedList] = useState([])
  const { t } = useTranslation()

  useEffect(() => {
    if (type === 'creator' || type === 'bookmark' || type === 'myFeatured' || type === 'fired') {
      getFeeds(type, creatorId)
    } else {
      const userIdentityType = authState.get('authUser')?.identityProvider?.type ?? 'guest'
      userIdentityType !== 'guest' ? getFeeds('featured') : getFeeds('featuredGuest')
    }
  }, [type, creatorId, feedsState.get('feedsFeatured')])

  useEffect(
    () =>
      (type === 'featured' || !type) &&
      feedsState.get('feedsFetching') === false &&
      setFeedList(feedsState.get('feedsFeatured')),
    [feedsState.get('feedsFetching'), feedsState.get('feedsFeatured')]
  )

  useEffect(
    () =>
      (type === 'featured' || !type) &&
      feedsState.get('feedsFeaturedFetching') === false &&
      setFeedList(feedsState.get('feedsFeatured')),
    [feedsState.get('feedsFeaturedFetching'), feedsState.get('feedsFeatured')]
  )

  useEffect(
    () =>
      type === 'creator' &&
      feedsState.get('feedsCreatorFetching') === false &&
      setFeedList(feedsState.get('feedsCreator')),
    [feedsState.get('feedsCreatorFetching'), feedsState.get('feedsCreator')]
  )

  useEffect(
    () =>
      type === 'bookmark' &&
      feedsState.get('feedsBookmarkFetching') === false &&
      setFeedList(feedsState.get('feedsBookmark')),
    [feedsState.get('feedsBookmarkFetching'), feedsState.get('feedsBookmark')]
  )

  useEffect(
    () =>
      type === 'myFeatured' &&
      feedsState.get('myFeaturedFetching') === false &&
      setFeedList(feedsState.get('myFeatured')),
    [feedsState.get('myFeaturedFetching'), feedsState.get('myFeatured')]
  )

  useEffect(
    () =>
      type === 'fired' && feedsState.get('feedsFiredFetching') === false && setFeedList(feedsState.get('feedsFired')),
    [feedsState.get('feedsFiredFetching'), feedsState.get('feedsFired')]
  )

  // if(type === 'creator'){
  //     setFeedList(feedsState.get('feedsCreator'));
  // }else if(type === 'bookmark'){
  //     setFeedList(feedsState.get('feedsBookmark'));
  // }else if(type === 'myFeatured'){
  //     setFeedList(feedsState.get('myFeatured'));
  // }else{

  // if(feedsState.get('fetching') === false){
  //    if(type === 'creator'){
  //         feedsList = feedsState?.get('feedsCreator');
  //     }else if(type === 'bookmark'){
  //         feedsList = feedsState?.get('feedsBookmark');
  //     }else if(type === 'myFeatured'){
  //         feedsList = feedsState?.get('myFeatured');
  //     }else{
  //         feedsList = feedsState?.get('feedsFeatured');
  //     }
  // }

  // const featureFeed = feedId =>setFeedAsFeatured(feedId);
  // const unfeatureFeed = feedId =>setFeedNotFeatured(feedId);

  // const renderFeaturedStar = (feedId ,creatorId, featured) =>{
  //     if(creatorId === creatorState.get('currentCreator')?.id){
  //         return <span className={styles.starLine} onClick={()=>featured ? unfeatureFeed(feedId) : featureFeed(feedId)} >{featured ? <StarIcon /> : <StarOutlineIcon />}</span>;
  //     }
  // };

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
                styles.creatorItem +
                ' ' +
                styles[sizeIndex] +
                ' ' +
                styles[topIndex] +
                ' ' +
                styles[width1_no_right_padding]
              }
              elevation={0}
              key={itemIndex}
            >
              {/* {renderFeaturedStar( item.id, item.creatorId, !!+item.featured)} */}
              <CardMedia
                className={styles.previewImage}
                image={item.previewUrl}
                onClick={() => {
                  if (popupsState.get('creatorPage') === true && popupsState.get('feedPage') === true) {
                    updateFeedPageState(false)
                    const intervalDelay = setTimeout(() => {
                      clearInterval(intervalDelay)
                      updateFeedPageState(true, item.id)
                    }, 100)
                  } else {
                    updateFeedPageState(true, item.id)
                  }
                }}
              />
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
