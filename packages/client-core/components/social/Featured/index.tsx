import React, { useEffect } from 'react';

import CardMedia from '@material-ui/core/CardMedia';
import Card from '@material-ui/core/Card';
import VisibilityIcon from '@material-ui/icons/Visibility';

import styles from './Featured.module.scss';
import { connect } from 'react-redux';
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

const Featured = ({feedsState, getFeeds}) => { 
    let feedsList = null;
    useEffect(()=> getFeeds('featured'), []);
    feedsList = feedsState.get('fetching') === false && feedsState?.get('feeds');
    return <section className={styles.feedContainer}>
        {feedsList && feedsList.map((item, itemIndex)=>
            <Card className={styles.creatorItem} elevation={0} key={itemIndex}>                 
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