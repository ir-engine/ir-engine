/**
 * @author Tanya Vykliuk <tanya.vykliuk@gmail.com>, Gleb Ordinsky
 */
import React, { useState, useEffect } from 'react'
import { bindActionCreators, Dispatch } from 'redux'

import { useHistory } from 'react-router-dom'
import { connect } from 'react-redux'

import CardMedia from '@material-ui/core/CardMedia'
import Typography from '@material-ui/core/Typography'
import Card from '@material-ui/core/Card'
import CardContent from '@material-ui/core/CardContent'
import WhatshotIcon from '@material-ui/icons/Whatshot'
import TelegramIcon from '@material-ui/icons/Telegram'
// import BookmarkBorderIcon from '@material-ui/icons/BookmarkBorder';
// import BookmarkIcon from '@material-ui/icons/Bookmark';
import VisibilityIcon from '@material-ui/icons/Visibility'
import Popover from '@material-ui/core/Popover'
import Button from '@material-ui/core/Button'
import CardHeader from '@material-ui/core/CardHeader'
import VerifiedUserIcon from '@material-ui/icons/VerifiedUser'
import Avatar from '@material-ui/core/Avatar'
import MoreHorizIcon from '@material-ui/icons/MoreHoriz'
import { Feed } from '@xrengine/common/src/interfaces/Feed'
import CreatorAsTitle from '../CreatorAsTitle'
import styles from './FeedCard.module.scss'
import SimpleModal from '../SimpleModal'
import { addViewToFeed, removeFeed } from '../../reducers/feed/service'
// import { addBookmarkToFeed, removeBookmarkToFeed } from '../../reducers/feedBookmark/service';
import { selectFeedFiresState } from '../../reducers/feedFires/selector'

// import { getFeedFires, addFireToFeed, removeFireToFeed } from '../../reducers/feedFires/service';
import { getFeedFires, addFireToFeed, removeFireToFeed } from '../../reducers/feedFires/service'
import PopupLogin from '../PopupLogin/PopupLogin'
// import { IndexPage } from '@xrengine/social/pages/login';
import { selectAuthState } from '../../../user/reducers/auth/selector'
import { selectCreatorsState } from '../../reducers/creator/selector'
import { getLoggedCreator } from '../../reducers/creator/service'
import Featured from '../Featured'
import { useTranslation } from 'react-i18next'
import { updateCreatorPageState, updateFeedPageState } from '../../reducers/popupsState/service'
import { Share } from '@capacitor/share'

const mapStateToProps = (state: any): any => {
  return {
    feedFiresState: selectFeedFiresState(state),
    authState: selectCreatorsState(state)
  }
}

const mapDispatchToProps = (dispatch: Dispatch): any => ({
  //     getFeedFires: bindActionCreators(getFeedFires, dispatch),
  //     addFireToFeed: bindActionCreators(addFireToFeed, dispatch),
  //     removeFireToFeed: bindActionCreators(removeFireToFeed, dispatch),
  getFeedFires: bindActionCreators(getFeedFires, dispatch),
  addFireToFeed: bindActionCreators(addFireToFeed, dispatch),
  removeFireToFeed: bindActionCreators(removeFireToFeed, dispatch),
  updateCreatorPageState: bindActionCreators(updateCreatorPageState, dispatch),
  updateFeedPageState: bindActionCreators(updateFeedPageState, dispatch),
  // addBookmarkToFeed: bindActionCreators(addBookmarkToFeed, dispatch),
  // removeBookmarkToFeed: bindActionCreators(removeBookmarkToFeed, dispatch),
  addViewToFeed: bindActionCreators(addViewToFeed, dispatch)
})
interface Props {
  feed: Feed
  feedFiresState?: any
  authState?: any
  //     getFeedFires?: typeof getFeedFires;
  //     addFireToFeed? : typeof addFireToFeed;
  //     removeFireToFeed?: typeof removeFireToFeed;
  getFeedFires?: any
  addFireToFeed?: any
  removeFireToFeed?: any
  updateCreatorPageState?: any
  updateFeedPageState?: any
  // addBookmarkToFeed?: typeof addBookmarkToFeed;
  // removeBookmarkToFeed?: typeof removeBookmarkToFeed;
  addViewToFeed?: typeof addViewToFeed
  removeFeed?: typeof removeFeed
}
const FeedCard = (props: Props): any => {
  const [buttonPopup, setButtonPopup] = useState(false)
  const [fired, setFired] = useState(false)
  //     const [isVideo, setIsVideo] = useState(false);
  //     const [openFiredModal, setOpenFiredModal] = useState(false);
  //     const {feed, getFeedFires, feedFiresState, addFireToFeed, removeFireToFeed, addViewToFeed} = props;
  const {
    feed,
    authState,
    getFeedFires,
    feedFiresState,
    addFireToFeed,
    removeFireToFeed,
    addViewToFeed,
    updateCreatorPageState,
    updateFeedPageState,
    removeFeed
  } = props
  const [firedCount, setFiredCount] = useState(feed.fires)
  const [videoDisplay, setVideoDisplay] = useState(false)
  const [feedFiresCreators, setFeedFiresCreators] = useState(null)

  const handleAddFireClick = (feedId) => {
    addFireToFeed(feedId)
    setFiredCount(firedCount + 1)
    setFired(true)
  }
  const handleRemoveFireClick = (feedId) => {
    removeFireToFeed(feedId)
    setFiredCount(firedCount - 1)
    setFired(false)
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
    getFeedFires(feed.id, setFeedFiresCreators)
    console.log('feed', feed)
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

  const creatorId = authState.get('currentCreator').id

  useEffect(() => {
    setFired(!!feedFiresCreators?.data.find((i) => i.id === creatorId))
  }, [feedFiresCreators])

  useEffect(() => {
    setVideoDisplay(false)
  }, [feed.id])

  const previewImageClick = () => {
    setVideoDisplay(true)
    addViewToFeed(feed.id)
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
                  onClick={() => updateCreatorPageState(true, feed.creator.id)}
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
              {feed.isFired ? (
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
              <TelegramIcon onClick={shareVia} />
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
        </CardContent>
      </Card>
      {/* <SimpleModal type={'feed-fires'} list={feedFiresState.get('feedFires')} open={openFiredModal} onClose={()=>setOpenFiredModal(false)} /> */}
      {/* <PopupLogin trigger={buttonPopup} setTrigger={setButtonPopup}> */}
      {/* <IndexPage /> */}
      {/* </PopupLogin> */}
    </>
  ) : (
    <></>
  )
}

export default connect(mapStateToProps, mapDispatchToProps)(FeedCard)
