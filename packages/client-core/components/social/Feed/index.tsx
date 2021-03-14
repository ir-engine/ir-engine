import React, { useEffect } from 'react';
import { bindActionCreators, Dispatch } from 'redux';
import { connect } from 'react-redux';

import FeedCard from '../common/FeedCard';
import CommentList from '../CommentList';
import NewComment from '../NewComment';
import { selectFeedsState } from '../../../redux/feed/selector';
import { getFeed } from '../../../redux/feed/service';

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
    getFeed?: any,
    feedId?:string;
}
const Feed = ({feedsState, getFeed, feedId} : Props) => { 
    let feed  = null as any;
    useEffect(()=> getFeed(feedId), []);
    feed = feedsState && feedsState.get('fetching') === false && feedsState.get('feed'); 

    return <section style={{overflow: 'scroll'}}>
            {feed && <FeedCard feed={feed} />}      
            {feed && <CommentList feedId={feed.id} />}  
            {feed && <NewComment feedId={feed.id} />}  
        </section>
};

export default connect(mapStateToProps, mapDispatchToProps)(Feed);