import React, { useEffect } from 'react';
import { random } from 'lodash';
import { bindActionCreators, Dispatch } from 'redux';

// import styles from './Feed.module.scss';
import FeedCard from '../FeedCard';
import CommentList from '../CommentList';
import NewComment from '../NewComment';
import { selectFeedsState } from '../../../redux/feed/selector';
import { getFeed } from '../../../redux/feed/service';
import { connect } from 'react-redux';

const mapStateToProps = (state: any): any => {
    return {
        feedsState: selectFeedsState(state),
    };
  };

  const mapDispatchToProps = (dispatch: Dispatch): any => ({
    getFeed: bindActionCreators(getFeed, dispatch),
});

interface Props{
    feedsState?: any,
    getFeed?: any
}
const Feed = ({feedsState, getFeed} : Props) => { 
    let feed = null;
    useEffect(()=> getFeed(random(50)), []);
    feed = feedsState.get('fetching') === false && feedsState?.get('feed'); 

    return <section style={{overflow: 'scroll'}}>
            {feed && <FeedCard {...feed} />}      
            <CommentList />  
            <NewComment />      
        </section>
};

export default connect(mapStateToProps, mapDispatchToProps)(Feed);