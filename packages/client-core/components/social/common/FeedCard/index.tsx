import React, { useEffect } from 'react';
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
import { addFireToFeed, getFeedFires, removeFireToFeed } from '../../../../redux/feedFires/service';
import { addViewToFeed } from '../../../../redux/feed/service';
import { addBookmarkToFeed, removeBookmarkToFeed } from '../../../../redux/feedBookmark/service';
import { selectFeedFiresState } from '../../../../redux/feedFires/selector';
import CreatorAsTitle from '../CreatorAsTitle';

import styles from './FeedCard.module.scss';

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
    const {feed, getFeedFires, feedFiresState, addFireToFeed, removeFireToFeed, addBookmarkToFeed, removeBookmarkToFeed, addViewToFeed} = props;
    useEffect(()=>{if(feed){getFeedFires(feed.id);}}, []);
    
    const handleAddFireClick = (feedId) =>addFireToFeed(feedId, '150');
    const handleRemoveFireClick = (feedId) =>removeFireToFeed(feedId, '150');

    const handleAddBookmarkClick = (feedId) =>addBookmarkToFeed(feedId, '150');
    const handleRemoveBookmarkClick = (feedId) =>removeBookmarkToFeed(feedId, '150');

    const handlePlayVideo = (feedId) => {
        //here should be redux hadler to service ho increment views for this feed
        console.log('handlePlayVideo feedId', feedId);
        addViewToFeed(feedId);
    }
    
    return  feed ? <Card className={styles.tipItem} square={false} elevation={0} key={feed.id}>
                <CreatorAsTitle creator={feed.creator} />                   
                <CardMedia   
                    className={styles.previewImage}                  
                    image={feed.preview}
                    title={feed.title}     
                    onClick={()=>handlePlayVideo(feed.id)}               
                />
                <span className={styles.eyeLine}>{feed.viewsCount}<VisibilityIcon style={{fontSize: '16px'}}/></span>
                <CardContent>
                    <Typography className={styles.titleContainer} gutterBottom variant="h2">
                        <span onClick={()=>Router.push('/feed')}>{feed.title}</span>
                        <section>
                            {feed.isFired ? 
                                    <WhatshotIcon htmlColor="#FF6201" onClick={()=>handleRemoveFireClick(feed.id)} /> 
                                    :
                                    <WhatshotIcon htmlColor="#DDDDDD" onClick={()=>handleAddFireClick(feed.id)} />}
                            <TelegramIcon />
                            {feed.isBookmarked ? <BookmarkIcon onClick={()=>handleRemoveBookmarkClick(feed.id)} /> : <BookmarkBorderIcon onClick={()=>handleAddBookmarkClick(feed.id)} />}
                        </section>
                    </Typography>
                    <Typography variant="h2" onClick={()=>console.log('Fires ',feedFiresState.get('feedFires'))}><span className={styles.flamesCount}>{feed.fires}</span>Flames</Typography>
                    <Typography variant="h2">{feed.description}</Typography>
                </CardContent>
            </Card>
        :''
};

export default connect(mapStateToProps, mapDispatchToProps)(FeedCard);