import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators, Dispatch } from 'redux';

import { selectFeedsState } from '../../../redux/feed/selector';
import { getFeeds } from '../../../redux/feed/service';

import FeedCard from '../common/FeedCard';

import styles from './TheFeed.module.scss';

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

const TheFeed = ({feedsState, getFeeds}: Props) => { 
    let feedsList = null;
    useEffect(()=> getFeeds(), []);
    feedsList = feedsState.get('fetching') === false && feedsState?.get('feeds');
    return <section className={styles.thefeedContainer}>
            {feedsList && feedsList.length > 0 && feedsList.map((item, key)=> <FeedCard key={key} feed = {...item} />)}
        </section>
};

export default connect(mapStateToProps, mapDispatchToProps)(TheFeed);