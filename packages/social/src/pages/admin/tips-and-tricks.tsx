
/**
 * @author Gleb Ordinsky <glebordinskijj@gmail.com>
 */
import React, { useEffect } from "react";
import Dashboard  from "@xr3ngine/client-core/src/socialmedia/components/Dashboard";
import ArMediaConsoleTipsAndTricks  from "@xr3ngine/client-core/src/admin/components/TipsAndTricks";
import { bindActionCreators, Dispatch } from "redux";
import { connect } from "react-redux";
import { selectFeedsState } from "@xr3ngine/client-core/src/socialmedia/reducers/feed/selector";
import { getFeeds } from "@xr3ngine/client-core/src/socialmedia/reducers/feed/service";
import { getTipsAndTricks } from "@xr3ngine/client-core/src/socialmedia/reducers/tips_and_tricks/service";

import { selectTipsAndTricksState } from '@xr3ngine/client-core/src/socialmedia/reducers/tips_and_tricks/selector'
import { client } from '@xr3ngine/client-core'



const mapStateToProps = (state: any): any => {
    return {
        feedsState: selectFeedsState(state),
        tipsAndTricksState: selectTipsAndTricksState(state),
        state: state
    };
};

const mapDispatchToProps = (dispatch: Dispatch): any => ({
    getFeeds: bindActionCreators(getFeeds, dispatch),
    getTipsAndTricks: bindActionCreators(getTipsAndTricks, dispatch),
});
interface Props{
    feedsState?: any,
    tipsAndTricksState?: any,
    getFeeds?: any,
    getTipsAndTricks?: any,
    state?: any
}


const TipsAndTricks = ({state, feedsState, tipsAndTricksState, getFeeds, getTipsAndTricks}:Props) => {
    useEffect(async ()=> {
        // getTipsAndTricks(1)
        // const data = async () => {
        //     await client.service('tips_and_tricks').create({
        //         title: 'Item 1',
        //         id: '1',
        //         video: 'video1.mp4',
        //         description: 'Tip number 1',
        //     })
        // }
        // data()
        // const feedsList = feedsState.get('fetching') === false && feedsState?.get('feedsAdmin') ? feedsState.get('feedsAdmin') : null;
        console.log('State: ', state);
        console.log('Feed State: ', feedsState);
        console.log('TipsAndTricks State: ', tipsAndTricksState);
    }, []);
    // const feedsList = feedsState.get('fetching') === false && feedsState?.get('feedsAdmin') ? feedsState.get('feedsAdmin') : null;
    return (<>
            <div>
                <Dashboard>
                    <ArMediaConsoleTipsAndTricks />
                </Dashboard>
            </div>
        </>
    );
};


export default connect(mapStateToProps, mapDispatchToProps)(TipsAndTricks);