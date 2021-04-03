import React, { useState } from 'react';
import { bindActionCreators, Dispatch } from 'redux';

import Router from "next/router";
import { connect } from 'react-redux';

import CardMedia from '@material-ui/core/CardMedia';
import Typography from '@material-ui/core/Typography';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import WhatshotIcon from '@material-ui/icons/Whatshot';
import TelegramIcon from '@material-ui/icons/Telegram';
import BookmarkBorderIcon from '@material-ui/icons/BookmarkBorder';
import BookmarkIcon from '@material-ui/icons/Bookmark';
import VisibilityIcon from '@material-ui/icons/Visibility';

import { Feed } from '@xr3ngine/common/interfaces/Feed';
import { addFireToFeed, getFeedFires, removeFireToFeed } from '../../../../reducers/feedFires/service';
import { addViewToFeed } from '../../../../reducers/feed/service';
import { addBookmarkToFeed, removeBookmarkToFeed } from '../../../../reducers/feedBookmark/service';
import { selectFeedFiresState } from '../../../../reducers/feedFires/selector';
import CreatorAsTitle from '../CreatorAsTitle';

import styles from './FeedCard.module.scss';
import SimpleModal from '../SimpleModal';

const mapStateToProps = (state: any): any => {
    return {
        feedFiresState: selectFeedFiresState(state),
    };
  };

  const mapDispatchToProps = (dispatch: Dispatch): any => ({
    getFeedFires: bindActionCreators(getFeedFires, dispatch),
    addFireToFeed: bindActionCreators(addFireToFeed, dispatch),
    removeFireToFeed: bindActionCreators(removeFireToFeed, dispatch),
    addBookmarkToFeed: bindActionCreators(addBookmarkToFeed, dispatch),
    removeBookmarkToFeed: bindActionCreators(removeBookmarkToFeed, dispatch),
    addViewToFeed : bindActionCreators(addViewToFeed, dispatch),
});
interface Props{
    feed : Feed,
    feedFiresState?: any,
    getFeedFires?: typeof getFeedFires;
    addFireToFeed? : typeof addFireToFeed;
    removeFireToFeed?: typeof removeFireToFeed;
    addBookmarkToFeed?: typeof addBookmarkToFeed;
    removeBookmarkToFeed?: typeof removeBookmarkToFeed;
    addViewToFeed?: typeof addViewToFeed;
}
const FeedCard = (props: Props) : any => {
    const [isVideo, setIsVideo] = useState(false);
    const [openFiredModal, setOpenFiredModal] = useState(false);
    const {feed, getFeedFires, feedFiresState, addFireToFeed, removeFireToFeed, addBookmarkToFeed, removeBookmarkToFeed, addViewToFeed} = props;
    
    const handleAddFireClick = (feedId) =>addFireToFeed(feedId);
    const handleRemoveFireClick = (feedId) =>removeFireToFeed(feedId);

    const handleAddBookmarkClick = (feedId) =>addBookmarkToFeed(feedId);
    const handleRemoveBookmarkClick = (feedId) =>removeBookmarkToFeed(feedId);

    const handlePlayVideo = (feedId) => {
        addViewToFeed(feedId);
    };

    const handleGetFeedFiredUsers = (feedId) => {
        if(feedId){
            getFeedFires(feedId);
            setOpenFiredModal(true);
        }
    };
    
    return  feed ? <><Card className={styles.tipItem} square={false} elevation={0} key={feed.id}>
                <CreatorAsTitle creator={feed.creator} />                   
                {isVideo ? <CardMedia   
                    className={styles.previewImage}                  
                    src={feed.videoUrl}
                    title={feed.title}  
                    component='video'      
                    controls  
                    autoPlay={true} 
                    onClick={()=>handlePlayVideo(feed.id)}               
                /> :
                <CardMedia   
                    className={styles.previewImage}                  
                    image={feed.previewUrl}
                    title={feed.title}                      
                    onClick={()=>setIsVideo(true)}               
                />}
                <span className={styles.eyeLine}>{feed.viewsCount}<VisibilityIcon style={{fontSize: '16px'}}/></span>
                <CardContent>
                    <section className={styles.iconsContainer}>
                        {feed.isFired ? 
                                <WhatshotIcon htmlColor="#FF6201" onClick={()=>handleRemoveFireClick(feed.id)} /> 
                                :
                                <WhatshotIcon htmlColor="#DDDDDD" onClick={()=>handleAddFireClick(feed.id)} />}
                        <TelegramIcon />
                        {feed.isBookmarked ? <BookmarkIcon onClick={()=>handleRemoveBookmarkClick(feed.id)} /> : <BookmarkBorderIcon onClick={()=>handleAddBookmarkClick(feed.id)} />}
                    </section>
                    <Typography className={styles.titleContainer} gutterBottom variant="h2" onClick={()=>Router.push({ pathname: '/feed', query:{ feedId: feed.id}})}>
                        {feed.title}                      
                    </Typography>
                    <Typography variant="h2" onClick={()=>handleGetFeedFiredUsers(feed.id)}><span className={styles.flamesCount}>{feed.fires}</span>Flames</Typography>
                    <Typography variant="h2">{feed.description}</Typography>
                </CardContent>
            </Card>
            <SimpleModal type={'feed-fires'} list={feedFiresState.get('feedFires')} open={openFiredModal} onClose={()=>setOpenFiredModal(false)} />
            </>
        :'';
};

export default connect(mapStateToProps, mapDispatchToProps)(FeedCard);