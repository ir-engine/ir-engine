import { random } from 'lodash';
import { Dispatch } from 'redux';
import { dispatchAlertError } from "../alert/service";
import { client } from '../feathers';
import {
  fetchingFeeds,
  feedsRetrieved,
  feedRetrieved,
  feedsFeaturedRetrieved,
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
            // $limit: limit != null ? limit : getState().get('feed').get('limit'),
            // $skip: skip != null ? skip : getState().get('feed').get('skip')
          }
        });
        // for(let i=0; i<51; i++){
        //     feedsResults.push({
        //         id: i,
        //         image :'https://picsum.photos/97/139',
        //         viewsCount: random(1500)
        //     })
        // }

        // TODO: remove map
        dispatch(feedsFeaturedRetrieved(feedsResults.data.map(feed => {
          return {
            ...feed,
            image: feed.preview
          }
        })));
      }else{
        // for(let i=0; i<20; i++){
        //   feedsResults.push({
        //         id: i,
        //         creator:{
        //             id: '169',
        //             avatar :'https://picsum.photos/40/40',
        //             username: 'User username'
        //         },
        //         preview:'https://picsum.photos/375/210',
        //         video:null,
        //         title: 'Featured Artist Post',
        //         fires: random(2000),
        //         description: 'I recently understood the words of my friend Jacob West about music.'
        //     })
        // }

        const feedsResults = await client.service('feed').find({
          query: {
            // $limit: limit != null ? limit : getState().get('feed').get('limit'),
            // $skip: skip != null ? skip : getState().get('feed').get('skip')
          }
        });
        console.log('feedsResults', feedsResults);
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
          const feed ={
            id: feedId,
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
            title: 'Featured Artist Post',
            fires: random(15000),
            stores: random(150),
            viewsCount:  random(15000),
            description: 'I recently understood the words of my friend Jacob West about music.'
        }
      // const feed = await client.service('feed').get(feedId);
      dispatch(feedRetrieved(feed));
    } catch(err) {
      console.log(err);
      dispatchAlertError(dispatch, err.message);
    }
  };
}
