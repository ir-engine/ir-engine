import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import Router from "next/router";

import CardMedia from '@material-ui/core/CardMedia';
import Card from '@material-ui/core/Card';
import VisibilityIcon from '@material-ui/icons/Visibility';

import styles from './Featured.module.scss';
import { selectFeedsState } from '../../../redux/feed/selector';
import { bindActionCreators, Dispatch } from 'redux';
import { getFeeds } from '../../../redux/feed/service';

const mapStateToProps = (state: any): any => {
    return {
        feedsState: selectFeedsState(state),
    };
  };

  const mapDispatchToProps = (dispatch: Dispatch): any => ({
    getFeeds: bindActionCreators(getFeeds, dispatch),
});
interface Props{
    feedsState?: any,
    getFeeds?: any,
    type?:string,
    creatorId?: string,
}

const Featured = ({feedsState, getFeeds, type, creatorId} : Props) => { 
    let feedsList = [];
    useEffect(()=> {
        if(type === 'creator' || type === 'bookmark'){
            getFeeds(type, creatorId);
        }else{
            getFeeds('featured');
        }
    }, [type]);
    if(feedsState.get('fetching') === false){
       if(type === 'creator'){
            feedsList = feedsState?.get('feedsCreator');
        }else if(type === 'bookmark'){
            feedsList = feedsState?.get('feedsBookmark');
        }else{
            feedsList = feedsState?.get('feedsFeatured');
        }
    }
    return <section className={styles.feedContainer}>
        {feedsList && feedsList.length > 0  && feedsList.map((item, itemIndex)=>
            <Card className={styles.creatorItem} elevation={0} key={itemIndex}  
                        onClick={()=>Router.push({ pathname: '/feed', query:{ feedId: item.id}})}>                 
                <CardMedia   
                    className={styles.previewImage}                  
                    image={item.previewUrl}
                />
                <span className={styles.eyeLine}>{item.viewsCount}<VisibilityIcon style={{fontSize: '16px'}}/></span>
            </Card>
        )}
        </section>
};

export default  connect(mapStateToProps, mapDispatchToProps)(Featured);