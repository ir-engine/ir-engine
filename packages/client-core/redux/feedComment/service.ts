import { random } from 'lodash';
import { Dispatch } from 'redux';
import { dispatchAlertError } from "../alert/service";
import { client } from '../feathers';
import {
  fetchingFeedComments, 
  feedsRetrieved,
  addFeedCommentFire,
  removeFeedCommentFire ,
  addFeedComment
} from './actions';
import { CommentInterface } from '@xr3ngine/common/interfaces/Comment';

export function getFeedComments(feedId : string, limit?: number) {
  return async (dispatch: Dispatch, getState: any): Promise<any> => {
    try {
      dispatch(fetchingFeedComments());
      const comments = await client.service('comments').find({query: {feedId}});
      dispatch(feedsRetrieved(comments.data));
    } catch(err) {
      console.log(err);
      dispatchAlertError(dispatch, err.message);
    }
  };
}

export function addFireToFeedComment(commentId: string, creatorId: string) {
  return async (dispatch: Dispatch): Promise<any> => {
    try {
      // await client.service('feedFires').create({feedId, creatorId});
      dispatch(addFeedCommentFire(commentId));
    } catch(err) {
      console.log(err);
      dispatchAlertError(dispatch, err.message);
    }
  };
}

export function removeFireToFeedComment(commentId: string, creatorId: string) {
  return async (dispatch: Dispatch): Promise<any> => {
    try {
      // await client.service('feedFires').create({feedId, creatorId});
      dispatch(removeFeedCommentFire(commentId));
    } catch(err) {
      console.log(err);
      dispatchAlertError(dispatch, err.message);
    }
  };
}

export function addCommentToFeed(feedId: string, text: string) {
  return async (dispatch: Dispatch): Promise<any> => {
    try {
      const newComment = await client.service('comments').create({feedId, text});
      // const toRedux = {
      //   feedId, 
      //   id: '4864', 
      //   creator:{
      //     id:creatorId,
      //     userId:'458',
      //     avatar :'https://picsum.photos/40/40',
      //     name: 'User username',
      //     username: 'username',
      //     verified : true,
      // },
      // fires: 0,
      // isFired: false,
      // text
      // }
      dispatch(addFeedComment(newComment));
    } catch(err) {
      console.log(err);
      dispatchAlertError(dispatch, err.message);
    }
  };
}