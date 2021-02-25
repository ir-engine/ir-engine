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
    getFeeds?: any
}

const Featured = ({feedsState, getFeeds} : Props) => { 
    let feedsList = null;
    useEffect(()=> getFeeds('featured'), []);
    feedsList = feedsState.get('fetching') === false && feedsState?.get('feedsFeatured');
    return <section className={styles.feedContainer}>
        {feedsList && feedsList.length > 0  && feedsList.map((item, itemIndex)=>
            <Card className={styles.creatorItem} elevation={0} key={itemIndex}  onClick={()=>Router.push('/feed')}>                 
                <CardMedia   
                    className={styles.previewImage}                  
                    image={item.image}
                />
                <span className={styles.eyeLine}>{item.viewsCount}<VisibilityIcon style={{fontSize: '16px'}}/></span>
            </Card>
        )}
        </section>
};

export default  connect(mapStateToProps, mapDispatchToProps)(Featured);