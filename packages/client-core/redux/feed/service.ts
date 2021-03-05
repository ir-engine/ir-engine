import { random } from 'lodash';
import { Dispatch } from 'redux';
import { dispatchAlertError } from "../alert/service";
import { client } from '../feathers';
import {
  fetchingFeeds,
  feedsRetrieved,
  feedRetrieved,
  feedsFeaturedRetrieved,
  addFeedView,
  addFeed
} from './actions';

export function getFeeds(type : string, limit?: number) {
  return async (dispatch: Dispatch, getState: any): Promise<any> => {
    try {
      dispatch(fetchingFeeds());
      const feedsResults = [];
      if(type && type === 'featured'){
        const feedsResults = await client.service('feed').find({
          query: {
            action: 'featured'
          }
        });
        dispatch(feedsFeaturedRetrieved(feedsResults.data));
      }else{
               const feedsResults = await client.service('feed').find({
          query: {
          }
        });
        dispatch(feedsRetrieved(feedsResults.data));
      }
      //  await client.service('feed').find({
      //   query: {
      //     $limit: limit != null ? limit : getState().get('feed').get('limit'),
      //     $skip: skip != null ? skip : getState().get('feed').get('skip')
      //   }
      // });
    } catch(err) {
      console.log(err);
      dispatchAlertError(dispatch, err.message);
    }
  };
}

export function getFeed(feedId: string) {
  return async (dispatch: Dispatch): Promise<any> => {
    try {
      dispatch(fetchingFeeds());
      const feed = await client.service('feed').get(feedId);        
      dispatch(feedRetrieved(feed));
    } catch(err) {
      console.log(err);
      dispatchAlertError(dispatch, err.message);
    }
  };
}

export function addViewToFeed(feedId: string) {
  return async (dispatch: Dispatch): Promise<any> => {
    try {
      // await client.service('feed').put({feedId, creatorId});
      dispatch(addFeedView(feedId));
    } catch(err) {
      console.log(err);
      dispatchAlertError(dispatch, err.message);
    }
  };
}

export function createFeed({title, description }: any) {
  return async (dispatch: Dispatch): Promise<any> => {
    try {
      // await client.service('feed').create({title, description});
      const feed ={
        id: '753954',
        creator:{
            id:'185',
            avatar :'https://picsum.photos/40/40',
            username: 'User username',
            name: '@username',
            userId: 'userId',
            verified: true,
        },
        preview:'https://picsum.photos/375/210',
        video:null,
        title,
        fires: 0,
        stores:0,
        viewsCount:  0,
        description
    }
      dispatch(addFeed(feed));
    } catch(err) {
      console.log(err);
      dispatchAlertError(dispatch, err.message);
    }
  };
}
