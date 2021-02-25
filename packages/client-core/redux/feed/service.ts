import { random } from 'lodash';
import { Dispatch } from 'redux';
import { dispatchAlertError } from "../alert/service";
import { client } from '../feathers';
import {
  fetchingFeeds,
  feedsRetrieved,
  feedRetrieved,
} from './actions';

export function getFeeds(type?: string, limit?: number) {
  return async (dispatch: Dispatch, getState: any): Promise<any> => {
    try {
      dispatch(fetchingFeeds());
      const feedsResults = [];
      console.log('type',type)
      if(type && type === 'featured'){
        for(let i=0; i<51; i++){
          feedsResults.push({ 
              id: i, 
              image :'https://picsum.photos/97/139',
              viewsCount: random(1500)
          })
      }
      }else{
      for(let i=0; i<20; i++){
        feedsResults.push({ 
              id: i,
              creator:{
                  id: '169',
                  avatar :'https://picsum.photos/40/40',
                  username: 'User username'
              },
              preview:'https://picsum.photos/375/210',
              video:null,
              title: 'Featured Artist Post',
              fires: random(2000),
              description: 'I recently understood the words of my friend Jacob West about music.'
          })
      }      
    }
      //  await client.service('feed').find({
      //   query: {
      //     $limit: limit != null ? limit : getState().get('feed').get('limit'),
      //     $skip: skip != null ? skip : getState().get('feed').get('skip')
      //   }
      // });
      dispatch(feedsRetrieved(feedsResults));
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
      console.log('getFeed feed:');
      console.log(feed);
      dispatch(feedRetrieved(feed));
    } catch(err) {
      console.log(err);
      dispatchAlertError(dispatch, err.message);
    }
  };
}