/**
 * @author Tanya Vykliuk <tanya.vykliuk@gmail.com>
 */
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useDispatch } from '@xrengine/client-core/src/store'

import { Typography } from '@mui/material'
import Card from '@mui/material/Card'
import CardMedia from '@mui/material/CardMedia'
import VisibilityIcon from '@mui/icons-material/Visibility'
import WhatshotIcon from '@mui/icons-material/Whatshot'
import FavoriteIcon from '@mui/icons-material/Favorite'

import { useAuthState } from '@xrengine/client-core/src/user/state/AuthState'
import { useFeedState } from '@xrengine/client-core/src/social/state/FeedState'
import { FeedService } from '@xrengine/client-core/src/social/state/FeedService'
import { usePopupsStateState } from '@xrengine/client-core/src/social/state/PopupsStateState'
import { PopupsStateService } from '@xrengine/client-core/src/social/state/PopupsStateService'
import styles from './Featured.module.scss'

interface Props {
  type?: string
  creatorId?: string
}

const Featured = ({ type, creatorId, thisData }: any) => {
  const { t } = useTranslation()
  const auth = useAuthState()
  const dispatch = useDispatch()
  const feedsState = useFeedState()
  const popupsState = usePopupsStateState()
  // useEffect(() => {
  //   if (auth.user.id.value) {
  //     if (type === 'creator' || type === 'bookmark' || type === 'myFeatured' || type === 'fired') {
  //       FeedService.getFeeds(type, creatorId)
  //     } else {
  //       const userIdentityType = auth.authUser?.identityProvider?.type?.value ?? 'guest'
  //       userIdentityType !== 'guest'
  //         ? FeedService.getFeeds('featured')
  //         : FeedService.getFeeds('featuredGuest')
  //     }
  //   }
  // }, [type, creatorId])

  // useEffect(
  //   () =>
  //     (type === 'featured' || !type) &&
  //     feedsState.feeds.feedsFeaturedFetching.value === false &&
  //     setFeedList(feedsState.feeds.feedsFeatured.value),
  //   [feedsState.feeds.feedsFeaturedFetching.value, JSON.stringify(feedsState.feeds.feedsFeatured.value)]
  // )

  // useEffect(
  //   () =>
  //     (type === 'featured' || !type) &&
  //     feedsState.feeds.feedsFetching.value === false &&
  //     setFeedList(feedsState.feeds.feedsFeatured.value),
  //   [feedsState.feeds.feedsFetching.value, JSON.stringify(feedsState.feeds.feedsFeatured.value)]
  // )

  // useEffect(
  //   () =>
  //     type === 'creator' &&
  //     feedsState.feeds.feedsCreatorFetching.value === false &&
  //     setFeedList(feedsState.feeds.feedsCreator.value),
  //   [feedsState.feeds.feedsCreatorFetching.value, JSON.stringify(feedsState.feeds.feedsCreator.value)]
  // )

  // useEffect(
  //   () =>
  //     type === 'bookmark' &&
  //     feedsState.feeds.feedsBookmarkFetching.value === false &&
  //     setFeedList(feedsState.feeds.feedsBookmark.value),
  //   [feedsState.feeds.feedsBookmarkFetching.value, JSON.stringify(feedsState.feeds.feedsBookmark.value)]
  // )

  // useEffect(
  //   () =>
  //     type === 'myFeatured' &&
  //     feedsState.feeds.myFeaturedFetching.value === false &&
  //     setFeedList(feedsState.feeds.myFeatured.value),
  //   [feedsState.feeds.myFeaturedFetching.value, JSON.stringify(feedsState.feeds.myFeatured.value)]
  // )

  // useEffect(
  //   () =>
  //     type === 'fired' &&
  //     feedsState.feeds.feedsFiredFetching.value === false &&
  //     setFeedList(feedsState.feeds.feedsFired.value),
  //   [feedsState.feeds.feedsFiredFetching.value, JSON.stringify(feedsState.feeds.feedsFired.value)]
  // )

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
      {thisData && thisData.length > 0 ? (
        thisData.map((item, itemIndex) => {
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
                  if (popupsState.popups.creatorPage?.value === true && popupsState.popups.feedPage?.value === true) {
                    PopupsStateService.updateFeedPageState(false)
                    const intervalDelay = setTimeout(() => {
                      clearInterval(intervalDelay)
                      PopupsStateService.updateFeedPageState(true, item.id)
                    }, 100)
                  } else {
                    PopupsStateService.updateFeedPageState(true, item.id)
                  }
                }}
              />
              <span className={styles.eyeLine}>
                {item.viewsCount}
                <VisibilityIcon style={{ fontSize: '16px' }} />
              </span>
              <span className={styles.fireLine}>
                {item.fires}
                <WhatshotIcon style={{ fontSize: '16px' }} />
              </span>
              <span className={styles.favoriteLine}>
                {item.likes}
                <FavoriteIcon style={{ fontSize: '16px' }} />
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

export default Featured
