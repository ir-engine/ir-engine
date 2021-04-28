/**
 * @author Tanya Vykliuk <tanya.vykliuk@gmail.com>
 */
import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';

import CardMedia from '@material-ui/core/CardMedia';
import Card from '@material-ui/core/Card';
import VisibilityIcon from '@material-ui/icons/Visibility';
import StarIcon from '@material-ui/icons/Star';
import StarOutlineIcon from '@material-ui/icons/StarOutline';

// @ts-ignore
import styles from './Featured.module.scss';
import { bindActionCreators, Dispatch } from 'redux';
import { selectCreatorsState } from '../../reducers/creator/selector';
import { selectFeedsState } from '../../reducers/feed/selector';
import { getFeeds, setFeedAsFeatured, setFeedNotFeatured } from '../../reducers/feed/service';
import { selectAuthState } from '../../../user/reducers/auth/selector';
import { updateFeedPageState } from '../../reducers/popupsState/service';

const mapStateToProps = (state: any): any => {
    return {
        feedsState: selectFeedsState(state),
        creatorState: selectCreatorsState(state),
        authState: selectAuthState(state),
    };
  };

  const mapDispatchToProps = (dispatch: Dispatch): any => ({
    getFeeds: bindActionCreators(getFeeds, dispatch),
    setFeedAsFeatured: bindActionCreators(setFeedAsFeatured, dispatch),
    setFeedNotFeatured: bindActionCreators(setFeedNotFeatured, dispatch),
    updateFeedPageState: bindActionCreators(updateFeedPageState, dispatch),
});
interface Props{
    feedsState?: any,
    authState?:any;
    getFeeds?: any,
    type?:string,
    creatorId?: string,
    creatorState?: any;
    setFeedAsFeatured?: typeof setFeedAsFeatured;
    setFeedNotFeatured?: typeof setFeedNotFeatured;
    updateFeedPageState?: typeof updateFeedPageState;
}

const Featured = ({feedsState, getFeeds, type, creatorId, creatorState, setFeedAsFeatured, setFeedNotFeatured, authState, updateFeedPageState} : Props) => { 
    const [feedsList, setFeedList] = useState([]);

    useEffect(()=> {
        if(type === 'creator' || type === 'bookmark' || type === 'myFeatured' || type === 'fired'){
            getFeeds(type, creatorId);            
        }else{
          const userIdentityType = authState.get('authUser')?.identityProvider?.type ?? 'guest';
          userIdentityType !== 'guest' ? getFeeds('featured') : getFeeds('featuredGuest');
        }
    }, [type, creatorId]);

    useEffect(()=> feedsState.get('feedsFeaturedFetching') === false &&setFeedList(feedsState.get('feedsFeatured'))
    ,[feedsState.get('feedsFeaturedFetching'), feedsState.get('feedsFeatured')]);
    
    useEffect(()=> feedsState.get('feedsCreatorFetching') === false &&setFeedList(feedsState.get('feedsCreator'))
    ,[feedsState.get('feedsCreatorFetching'), feedsState.get('feedsCreator')]);

    useEffect(()=> feedsState.get('feedsBookmarkFetching') === false &&setFeedList(feedsState.get('feedsBookmark'))
    ,[feedsState.get('feedsBookmarkFetching'), feedsState.get('feedsBookmark')]);

    useEffect(()=> feedsState.get('myFeaturedFetching') === false &&setFeedList(feedsState.get('myFeatured'))
    ,[feedsState.get('myFeaturedFetching'), feedsState.get('myFeatured')]);

    useEffect(()=> feedsState.get('feedsFiredFetching') === false && setFeedList(feedsState.get('feedsFired'))
    ,[feedsState.get('feedsFiredFetching'), feedsState.get('feedsFired')]);

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

    return <section className={styles.feedContainer}>
        {feedsList && feedsList.length > 0  && feedsList.map((item, itemIndex)=>
            <Card className={styles.creatorItem} elevation={0} key={itemIndex}>
                    {/* {renderFeaturedStar( item.id, item.creatorId, !!+item.featured)} */}
                <CardMedia
                    className={styles.previewImage}
                    image={item.previewUrl}
                    onClick={()=>updateFeedPageState(true, item.id)}
                />
                <span className={styles.eyeLine}>{item.viewsCount}<VisibilityIcon style={{fontSize: '16px'}}/></span>
            </Card>
        )}
        </section>;
};

export default  connect(mapStateToProps, mapDispatchToProps)(Featured);
