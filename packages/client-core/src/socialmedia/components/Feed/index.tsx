/**
 * @author Tanya Vykliuk <tanya.vykliuk@gmail.com>
 */
import React, { useEffect } from 'react';
import { bindActionCreators, Dispatch } from 'redux';
import { connect } from 'react-redux';

import FeedCard from '../FeedCard';
import CommentList from '../CommentList';
import NewComment from '../NewComment';
import { selectFeedsState } from '../../reducers/feed/selector';
import { getFeed } from '../../reducers/feed/service';
import { selectPopupsState } from '../../reducers/popupsState/selector';
import { updateFeedPageState } from '../../reducers/popupsState/service';
import { Button } from '@material-ui/core';
import ArrowBackIosIcon from '@material-ui/icons/ArrowBackIos';

// @ts-ignore
import styles from './Feed.module.scss'
import Featured from '../Featured';

const mapStateToProps = (state: any): any => {
    return {
        feedsState: selectFeedsState(state),
        popupsState: selectPopupsState(state),
    };
  };

  const mapDispatchToProps = (dispatch: Dispatch): any => ({
    getFeed: bindActionCreators(getFeed, dispatch),
    updateFeedPageState: bindActionCreators(updateFeedPageState, dispatch),
});

interface Props{
    feedsState?: any,
    getFeed?: any,
    feedId?:string;
    popupsState?:any;
    updateFeedPageState?: typeof updateFeedPageState;
}
const Feed = ({feedsState, getFeed, popupsState, updateFeedPageState} : Props) => { 
    let feed  = null as any;
    useEffect(()=> getFeed(popupsState.get('feedId')), []);
    feed = feedsState && feedsState.get('fetching') === false && feedsState.get('feed'); 

    return <section className={styles.feedContainer}>
            <section className={styles.controls}>
                <Button variant="text" className={styles.backButton} 
                onClick={()=>updateFeedPageState(false)}><ArrowBackIosIcon />Back</Button>  
            </section>
            {feed && <FeedCard feed={feed} />} 
            {feed && <Featured type='creator' creatorId={feed.creatorId} />}
            {/*hided for now*/}
            {/* {feed && <CommentList feedId={feed.id} />}   */}
            {/* {feed && <NewComment feedId={feed.id} />}   */}
        </section>;
};

export default connect(mapStateToProps, mapDispatchToProps)(Feed);