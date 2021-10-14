/**
 * @author Tanya Vykliuk <tanya.vykliuk@gmail.com>, Gleb Ordinsky
 */
import React, { useState, useEffect } from 'react'
import { bindActionCreators, Dispatch } from 'redux'

import { useHistory } from 'react-router-dom'
import { connect, useDispatch } from 'react-redux'

import CardMedia from '@material-ui/core/CardMedia'
import Typography from '@material-ui/core/Typography'
import Card from '@material-ui/core/Card'
import CardContent from '@material-ui/core/CardContent'
import WhatshotIcon from '@material-ui/icons/Whatshot'
import TelegramIcon from '@material-ui/icons/Telegram'
import AddCommentIcon from '@material-ui/icons/AddCommentOutlined'
import FavoriteBorderOutlinedIcon from '@material-ui/icons/FavoriteBorderOutlined'
import FavoriteIcon from '@material-ui/icons/Favorite'
import VisibilityIcon from '@material-ui/icons/Visibility'
import Popover from '@material-ui/core/Popover'
import Button from '@material-ui/core/Button'
import CardHeader from '@material-ui/core/CardHeader'
import VerifiedUserIcon from '@material-ui/icons/VerifiedUser'
import Avatar from '@material-ui/core/Avatar'
import ReportOutlinedIcon from '@material-ui/icons/ReportOutlined'
import MoreHorizIcon from '@material-ui/icons/MoreHoriz'
import { Feed } from '@xrengine/common/src/interfaces/Feed'
import CreatorAsTitle from '../CreatorAsTitle'
// @ts-ignore
import styles from './FeedCard.module.scss'
import SimpleModal from '../SimpleModal'
import { FeedService } from '@xrengine/client-core/src/social/reducers/feed/FeedService'

import { FeedFiresService } from '@xrengine/client-core/src/social/reducers/feedFires/FeedFiresService'
import { FeedLikesService } from '../../reducers/feedLikes/FeedLikesService'

import { useTranslation } from 'react-i18next'

import { PopupsStateService } from '@xrengine/client-core/src/social/reducers/popupsState/PopupsStateService'
import { FeedReportsService } from '../../reducers/feedReport/FeedReportsService'
import { Share } from '@capacitor/share'
import Snackbar from '@material-ui/core/Snackbar'
import Alert from '@material-ui/lab/Alert'
import CommentList from '../CommentList'
import Grid from '@material-ui/core/Grid'

interface Props {
  feed: Feed
}

const FeedCard = (props: Props): any => {
  const [liked, setLiked] = useState(false)
  const [buttonPopup, setButtonPopup] = useState(false)
  const [fired, setFired] = useState(false)
  const [reported, setReported] = useState(false)
  const dispatch = useDispatch()
  //     const [isVideo, setIsVideo] = useState(false);
  //     const [openFiredModal, setOpenFiredModal] = useState(false);
  //     const {feed, getFeedFires, feedFiresState, addFireToFeed, removeFireToFeed, addViewToFeed} = props;
  const { feed } = props
  const [firedCount, setFiredCount] = useState(feed.fires)
  const [likedCount, setLikedCount] = useState(feed.likes)
  const [videoDisplay, setVideoDisplay] = useState(false)
  const [feedFiresCreators, setFeedFiresCreators] = useState(null)
  const [feedLikesCreators, setFeedLikesCreators] = useState(null)

  const handleAddFireClick = (feedId) => {
    dispatch(FeedFiresService.addFireToFeed(feedId))
    setFiredCount(firedCount + 1)
    setFired(true)
    if (liked) {
      handleRemoveLikeClick(feedId)
    }
  }

  const handleRemoveFireClick = (feedId) => {
    dispatch(FeedFiresService.removeFireToFeed(feedId))
    setFiredCount(firedCount - 1)
    setFired(false)
  }

  const handleAddLikeClick = (feedId) => {
    dispatch(FeedLikesService.addLikeToFeed(feedId))
    setLikedCount(likedCount + 1)
    setLiked(true)
    if (fired) {
      handleRemoveFireClick(feedId)
    }
  }

  const handleRemoveLikeClick = (feedId) => {
    dispatch(FeedLikesService.removeLikeToFeed(feedId))
    setLikedCount(likedCount - 1)
    setLiked(false)
  }

  const handleReportFeed = (feedId) => {
    dispatch(FeedReportsService.addReportToFeed(feedId))
    setReported(true)
  }

  //hided for now
  // const handleAddBookmarkClick = (feedId) =>addBookmarkToFeed(feedId);
  // const handleRemoveBookmarkClick = (feedId) =>removeBookmarkToFeed(feedId);

  //     const handlePlayVideo = (feedId) => {
  //         !checkGuest && addViewToFeed(feedId);
  //     };

  //     const handleGetFeedFiredUsers = (feedId) => {
  //         if(feedId){
  //             setOpenFiredModal(true);
  //         }
  //     };
  useEffect(() => {
    dispatch(FeedFiresService.getFeedFires(feed.id))
  }, [])

  const { t } = useTranslation()
  const shareVia = () => {
    Share.share({
      title: t('social:shareForm.arcMedia'),
      text: t('social:shareForm.videoCreated'),
      url: encodeURI(feed.videoUrl),
      dialogTitle: t('social:shareForm.shareWithBuddies')
    })
  }

  // const handleGetFeedFiredUsers = (feedId) => {
  //     if(feedId){
  //         getFeedFires(feedId);
  //         setOpenFiredModal(true);
  //     }
  // };

  //     const checkGuest = props.authState.get('authUser')?.identityProvider?.type === 'guest' ? true : false;

  //const creatorId = authState.get('currentCreator').id

  useEffect(() => {
    setVideoDisplay(true)
    setFired(feed.isFired)
    setLiked(feed.isLiked)
  }, [feed.id])

  const previewImageClick = () => {
    setVideoDisplay(true)
    dispatch(FeedService.addViewToFeed(feed.id))
  }

  useEffect(() => {
    console.log('Feed Card Feed:', feed)
  })

  return feed ? (
    <>
      <Card className={styles.tipItem} square={false} elevation={0} key={feed.id}>
        {/*                 {isVideo ? <CardMedia    */}
        {/*                     className={styles.previewImage}                   */}
        {/*                     src={feed.videoUrl} */}
        {/*                     title={feed.title}   */}
        {/*                     component='video'       */}
        {/*                     controls   */}
        {/*                     autoPlay={true}  */}
        {/*                     onClick={()=>handlePlayVideo(feed.id)}                */}
        {/*                 /> : */}
        {/*                 <CardMedia    */}
        {/*                     className={styles.previewImage}                   */}
        {/*                     image={feed.previewUrl} */}
        {/*                     title={feed.title}                       */}
        {/*                     onClick={()=>setIsVideo(true)}                */}
        {/*                 />} */}
        <Grid container alignItems="flex-end">
          <Grid xs item>
            {!videoDisplay ? (
              <img src={feed.previewUrl} className={styles.previewImage} alt={feed.title} onClick={previewImageClick} />
            ) : (
              <CardMedia
                className={styles.previewImage}
                component="video"
                src={feed.videoUrl}
                title={feed.title}
                controls
              />
            )}
            <span className={styles.eyeLine}>
              {feed.viewsCount}
              <VisibilityIcon style={{ fontSize: '16px' }} />
            </span>
          </Grid>
          <Grid item>
            <div className={styles.iconSubContainerVertical}>
              <div>
                {liked ? (
                  <FavoriteIcon htmlColor="red" onClick={() => handleRemoveLikeClick(feed.id)} />
                ) : (
                  <FavoriteBorderOutlinedIcon htmlColor="#DDDDDD" onClick={() => handleAddLikeClick(feed.id)} />
                )}
                <span className={styles.counter}>{likedCount}</span>
              </div>
              <div>
                {fired ? (
                  <WhatshotIcon
                    className={styles.fireIcon}
                    htmlColor="#FF6201"
                    onClick={() => handleRemoveFireClick(feed.id)}
                  />
                ) : (
                  <WhatshotIcon
                    className={styles.fireIcon}
                    htmlColor="#DDDDDD"
                    onClick={() => handleAddFireClick(feed.id)}
                  />
                )}
                <span className={styles.counter}>{firedCount}</span>
              </div>
            </div>
          </Grid>
        </Grid>

        <CardContent className={styles.cardContent}>
          <section className={styles.iconsContainer}>
            {/*                         <Typography className={styles.titleContainer} gutterBottom variant="h4" */}
            {/* //                         onClick={()=>history.push('/feed?feedId=' + feed.id)} */}
            {/*                         > */}
            {/*                             {feed.title} */}
            {/*                         </Typography> */}

            <CardHeader
              avatar={
                <Avatar
                  src={feed.creator.avatar ? feed.creator.avatar : '/assets/userpic.png'}
                  alt={feed.creator.username}
                  onClick={() => dispatch(PopupsStateService.updateCreatorPageState(true, feed.creator.id))}
                  className={styles.avatar}
                />
              }
              title={
                <Typography variant="h6">
                  {feed.creator.name}
                  <p>
                    @{feed.creator.username} · {feed.fires} flames
                  </p>
                  {feed.creator.verified === true && (
                    <VerifiedUserIcon htmlColor="#007AFF" style={{ fontSize: '13px', margin: '0 0 0 5px' }} />
                  )}
                </Typography>
              }
            />
            <section className={styles.iconSubContainer}>
              <TelegramIcon onClick={shareVia} />
              <AddCommentIcon onClick={null} />
              <ReportOutlinedIcon htmlColor="#FF0000" onClick={() => handleReportFeed(feed.id)} />
            </section>
            {/*hided for now*/}
            {/* {feed.isBookmarked ? <BookmarkIcon onClick={()=>checkGuest ? setButtonPopup(true) : handleRemoveBookmarkClick(feed.id)} />
                         :
                         <BookmarkBorderIcon onClick={()=>checkGuest ? setButtonPopup(true) : handleAddBookmarkClick(feed.id)} />} */}
          </section>

          {/*                     <Typography variant="h2" onClick={()=>checkGuest ? setButtonPopup(true) : handleGetFeedFiredUsers(feed.id)}><span className={styles.flamesCount}>{feed.fires}</span>Flames</Typography> */}

          <Typography className={styles.cartText} variant="h6">
            {feed.description}
          </Typography>
          <CommentList feedId={feed.id} />
        </CardContent>
      </Card>
      {/* <SimpleModal type={'feed-fires'} list={feedFiresState.get('feedFires')} open={openFiredModal} onClose={()=>setOpenFiredModal(false)} /> */}
      {/* <PopupLogin trigger={buttonPopup} setTrigger={setButtonPopup}> */}
      {/* <IndexPage /> */}
      {/* </PopupLogin> */}
      <Snackbar
        open={reported}
        autoHideDuration={2000}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'center'
        }}
        onClose={() => setReported(false)}
      >
        <Alert severity="error">{t('social:feed.is-repoted-message')}</Alert>
      </Snackbar>
    </>
  ) : (
    <></>
  )
}

export default FeedCard
