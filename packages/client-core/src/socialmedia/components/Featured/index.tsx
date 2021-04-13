import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import Router from "next/router";

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
}

const Featured = ({feedsState, getFeeds, type, creatorId, creatorState, setFeedAsFeatured, setFeedNotFeatured, authState} : Props) => { 
    let feedsList = [];
    useEffect(()=> {
        if(type === 'creator' || type === 'bookmark' || type === 'myFeatured'){
            getFeeds(type, creatorId);
        }else{
            authState.get('authUser').identityProvider.type === 'guest' ? 
                getFeeds('featuredGuest') : getFeeds('featured');
        }
    }, [type, creatorId]);
    if(feedsState.get('fetching') === false){
       if(type === 'creator'){
            feedsList = feedsState?.get('feedsCreator');
        }else if(type === 'bookmark'){
            feedsList = feedsState?.get('feedsBookmark');
        }else if(type === 'myFeatured'){
            feedsList = feedsState?.get('myFeatured');
        }else{
            feedsList = feedsState?.get('feedsFeatured');
        }
    }
    
    const featureFeed = feedId =>setFeedAsFeatured(feedId);
    const unfeatureFeed = feedId =>setFeedNotFeatured(feedId);

    const renderFeaturedStar = (feedId ,creatorId, featured) =>{
        if(creatorId === creatorState.get('currentCreator')?.id){
            return <span className={styles.starLine} onClick={()=>featured ? unfeatureFeed(feedId) : featureFeed(feedId)} >{featured ? <StarIcon /> : <StarOutlineIcon />}</span>;
        }
    };
    return <section className={styles.feedContainer}>
        {feedsList && feedsList.length > 0  && feedsList.map((item, itemIndex)=>
            <Card className={styles.creatorItem} elevation={0} key={itemIndex}>         
                    {renderFeaturedStar( item.id, item.creatorId, !!+item.featured)}        
                <CardMedia   
                    className={styles.previewImage}                  
                    image={item.previewUrl}
                    onClick={()=>Router.push({ pathname: '/feed', query:{ feedId: item.id}})}
                />
                <span className={styles.eyeLine}>{item.viewsCount}<VisibilityIcon style={{fontSize: '16px'}}/></span>
            </Card>
        )}
        </section>;
};

export default  connect(mapStateToProps, mapDispatchToProps)(Featured);