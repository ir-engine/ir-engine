/**
 * @author Tanya Vykliuk <tanya.vykliuk@gmail.com>, Gleb Ordinsky
 */
import React, { useState, useEffect } from 'react';
import { bindActionCreators, Dispatch } from 'redux';

import { useHistory } from "react-router-dom";
import { connect } from 'react-redux';

import CardMedia from '@material-ui/core/CardMedia';
import Typography from '@material-ui/core/Typography';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import WhatshotIcon from '@material-ui/icons/Whatshot';
// import TelegramIcon from '@material-ui/icons/Telegram';
// import BookmarkBorderIcon from '@material-ui/icons/BookmarkBorder';
// import BookmarkIcon from '@material-ui/icons/Bookmark';
import VisibilityIcon from '@material-ui/icons/Visibility';

import { Feed } from '@xrengine/common/src/interfaces/Feed';
import CreatorAsTitle from '../CreatorAsTitle';
// @ts-ignore
import styles from './FeedCard.module.scss';
import SimpleModal from '../SimpleModal';
import { addViewToFeed } from '../../reducers/feed/service';
// import { addBookmarkToFeed, removeBookmarkToFeed } from '../../reducers/feedBookmark/service';
import { selectFeedFiresState } from '../../reducers/feedFires/selector';
import { selectTheFeedsFiresState } from '../../reducers/thefeedsFires/selector';

// import { getFeedFires, addFireToFeed, removeFireToFeed } from '../../reducers/feedFires/service';
import { getTheFeedsFires, addFireToTheFeeds, removeFireToTheFeeds } from '../../reducers/thefeedsFires/service';
import PopupLogin from '../PopupLogin/PopupLogin';
// import { IndexPage } from '@xrengine/social/pages/login';
import { selectAuthState } from '../../../user/reducers/auth/selector';
import { selectCreatorsState } from '../../reducers/creator/selector';
import { getLoggedCreator } from '../../reducers/creator/service';


import Featured from '../Featured';
import { Plugins } from '@capacitor/core';
import { useTranslation } from 'react-i18next';

const { Share } = Plugins;

const mapStateToProps = (state: any): any => {
    return {
        thefeedsFiresState: selectTheFeedsFiresState(state),
        authState: selectCreatorsState(state),
    };
  };

  const mapDispatchToProps = (dispatch: Dispatch): any => ({
//     getFeedFires: bindActionCreators(getFeedFires, dispatch),
//     addFireToFeed: bindActionCreators(addFireToFeed, dispatch),
//     removeFireToFeed: bindActionCreators(removeFireToFeed, dispatch),
    getTheFeedsFires: bindActionCreators(getTheFeedsFires, dispatch),
    addFireToTheFeeds: bindActionCreators(addFireToTheFeeds, dispatch),
    removeFireToTheFeeds: bindActionCreators(removeFireToTheFeeds, dispatch)
    // addBookmarkToFeed: bindActionCreators(addBookmarkToFeed, dispatch),
    // removeBookmarkToFeed: bindActionCreators(removeBookmarkToFeed, dispatch),
//     addViewToFeed : bindActionCreators(addViewToFeed, dispatch),
});
interface Props{
    feed : Feed;
    thefeedsFiresState?: any;
    authState?: any;
//     getFeedFires?: typeof getFeedFires;
//     addFireToFeed? : typeof addFireToFeed;
//     removeFireToFeed?: typeof removeFireToFeed;
    getTheFeedsFires?: any,
    addFireToTheFeeds?: any,
    removeFireToTheFeeds?: any,
    // addBookmarkToFeed?: typeof addBookmarkToFeed;
    // removeBookmarkToFeed?: typeof removeBookmarkToFeed;
//     addViewToFeed?: typeof addViewToFeed;
}
const FeedCard = (props: Props) : any => {
    const [buttonPopup , setButtonPopup] = useState(false);
    const [fired , setFired] = useState(false);
//     const [isVideo, setIsVideo] = useState(false);
//     const [openFiredModal, setOpenFiredModal] = useState(false);
//     const {feed, getFeedFires, feedFiresState, addFireToFeed, removeFireToFeed, addViewToFeed} = props;
    const {feed, authState, getTheFeedsFires, thefeedsFiresState, addFireToTheFeeds, removeFireToTheFeeds} = props;
    const [firedCount, setFiredCount] = useState(feed.fires);

    const [thefeedsFiresCreators, setThefeedsFiresCreators] = useState(null);

    const handleAddFireClick = (feedId) =>{
        addFireToTheFeeds(feedId)
        setFiredCount(firedCount+1)
        setFired(true)
    };
    const handleRemoveFireClick = (feedId) =>{
        removeFireToTheFeeds(feedId);
        setFiredCount(firedCount-1)
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
    useEffect(()=> {
         getTheFeedsFires(feed.id, setThefeedsFiresCreators)
    }, []);

    const { t } = useTranslation();
    const shareVia = () => {
        Share.share({
            title: t('social:shareForm.seeCoolStuff'),
            text: t('social:shareForm.videoCreated'),
            url: feed.videoUrl,
            dialogTitle: t('social:shareForm.shareWithBuddies')
          });
       };

    // const handleGetFeedFiredUsers = (feedId) => {
    //     if(feedId){
    //         getFeedFires(feedId);
    //         setOpenFiredModal(true);
    //     }
    // };
    
    const checkGuest = props.authState.get('authUser')?.identityProvider?.type === 'guest' ? true : false;

    const theFeedsFiresList = thefeedsFiresState?.get('thefeedsFires');
    const creatorId = authState.get('currentCreator').id

    useEffect(()=> {
            setFired(!!thefeedsFiresCreators?.data.find(i=>i.id === creatorId))
    },[thefeedsFiresCreators]);
    return  feed ? <><Card className={styles.tipItem} square={false} elevation={0} key={feed.id}>
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
                {feed.videoUrl ? <CardMedia
                    className={styles.previewImage}
                    component='video'
                    src={feed.videoUrl}
                    title={feed.title}
                    controls
                /> : ''}
                <span className={styles.eyeLine}>{feed.viewsCount}<VisibilityIcon style={{fontSize: '16px'}}/></span>
                <CardContent className={styles.cardContent}>                     
                    <section className={styles.iconsContainer}>
                        <Typography className={styles.titleContainer} gutterBottom variant="h4"
//                         onClick={()=>history.push('/feed?feedId=' + feed.id)}
                        >
                            {feed.title}
                        </Typography>
                        <CreatorAsTitle creator={feed.creator} />
                        <section className={styles.iconSubContainer}>
                            {fired ?
                                <WhatshotIcon className={styles.fireIcon} htmlColor="#FF6201"
                                    onClick={()=>handleRemoveFireClick(feed.id)} />
                                :
                                <WhatshotIcon className={styles.fireIcon} htmlColor="#DDDDDD"
                                    onClick={()=>handleAddFireClick(feed.id)} />}
                            <TelegramIcon onClick={shareVia}/>
                        </section>
                        {/*hided for now*/}
                        {/* {feed.isBookmarked ? <BookmarkIcon onClick={()=>checkGuest ? setButtonPopup(true) : handleRemoveBookmarkClick(feed.id)} />
                         : 
                         <BookmarkBorderIcon onClick={()=>checkGuest ? setButtonPopup(true) : handleAddBookmarkClick(feed.id)} />} */}
                    </section>

{/*                     <Typography variant="h2" onClick={()=>checkGuest ? setButtonPopup(true) : handleGetFeedFiredUsers(feed.id)}><span className={styles.flamesCount}>{feed.fires}</span>Flames</Typography> */}
                    <Typography variant="subtitle2">{firedCount} flames</Typography>
                    <Typography variant="h6">{feed.description}</Typography>
                </CardContent>
            </Card>
            {/* <SimpleModal type={'feed-fires'} list={feedFiresState.get('feedFires')} open={openFiredModal} onClose={()=>setOpenFiredModal(false)} /> */}
            {/* <PopupLogin trigger={buttonPopup} setTrigger={setButtonPopup}> */}
                {/* <IndexPage /> */}
            {/* </PopupLogin> */}
            </>
        :<></>;
};

export default connect(mapStateToProps, mapDispatchToProps)(FeedCard);