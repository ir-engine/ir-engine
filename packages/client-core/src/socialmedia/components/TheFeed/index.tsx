/**
 * @author Tanya Vykliuk <tanya.vykliuk@gmail.com>
 */
import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators, Dispatch } from 'redux';
// import { selectAuthState } from '../../../user/reducers/auth/selector';
// import { selectFeedsState } from '../../reducers/feed/selector';
// import { getFeeds } from '../../reducers/feed/service';
import {getTheFeedsNew} from '@xrengine/client-core/src/socialmedia/reducers/thefeeds/service';
import { selectTheFeedsState } from '@xrengine/client-core/src/socialmedia/reducers/thefeeds/selector';


import FeedCard from '../FeedCard';

// @ts-ignore
import styles from './TheFeed.module.scss';

const mapStateToProps = (state: any): any => {
    return {
        theFeedsState: selectTheFeedsState(state),
    };
  };

  const mapDispatchToProps = (dispatch: Dispatch): any => ({
    getTheFeedsNew: bindActionCreators(getTheFeedsNew, dispatch),
});
interface Props{
    theFeedsState?: any,
    getTheFeedsNew?: any
}

const TheFeed = ({theFeedsState, getTheFeedsNew}: Props) => {
    let feedsList = null;
    useEffect(()=> getTheFeedsNew(), []);
    const TheFeedsList = theFeedsState?.get('thefeeds') ? theFeedsState?.get('thefeeds') : [];
//     useEffect(()=> console.log(TheFeedsList), [TheFeedsList]);
    return <section className={styles.thefeedContainer}>
            {TheFeedsList && TheFeedsList.length > 0 && TheFeedsList.map((item, key)=> <FeedCard key={key} feed = {item} />)}
        </section>;
};

export default connect(mapStateToProps, mapDispatchToProps)(TheFeed);