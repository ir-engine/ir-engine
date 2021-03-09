import { Dispatch } from 'redux';
import { dispatchAlertError } from "../alert/service";
import { client } from '../feathers';
import {
  fetchingFeedFires,
  feedFiresRetrieved
} from './actions';
import {
  addFeedFire, removeFeedFire
} from '../feed/actions'

export function getFeedFires(feedId : string) {
  return async (dispatch: Dispatch, getState: any): Promise<any> => {
    try {
      dispatch(fetchingFeedFires());
      const feedFiresResults = [];
      // const feedsResults = await client.service('feedFires').find({query: {feedId: feedId}});
      feedFiresResults.push({ 
          id: '150',
          userId: '1245789',
          avatar :'https://picsum.photos/158/210',
          name: 'User username',
          username: '@username', 
          verified : true,
      })
      dispatch(feedFiresRetrieved(feedFiresResults));    
    } catch(err) {
      console.log(err);
      dispatchAlertError(dispatch, err.message);
    }
  };
}


export function addFireToFeed(feedId: string, creatorId: string) {
  return async (dispatch: Dispatch): Promise<any> => {
    try {
      // await client.service('feedFires').create({feedId, creatorId});
      dispatch(addFeedFire(feedId));
    } catch(err) {
      console.log(err);
      dispatchAlertError(dispatch, err.message);
    }
  };
}

export function removeFireToFeed(feedId: string, creatorId: string) {
  return async (dispatch: Dispatch): Promise<any> => {
    try {
      // await client.service('feedFires').create({feedId, creatorId});
      dispatch(removeFeedFire(feedId));
    } catch(err) {
      console.log(err);
      dispatchAlertError(dispatch, err.message);
    }
  };
}