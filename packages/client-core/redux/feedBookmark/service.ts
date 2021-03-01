import { Dispatch } from 'redux';
import { dispatchAlertError } from "../alert/service";
import { client } from '../feathers';
import {
  addFeedBookmark, removeFeedBookmark
} from '../feed/actions'

export function addBookmarkToFeed(feedId: string, creatorId: string) {
  return async (dispatch: Dispatch): Promise<any> => {
    try {
      // await client.service('feedBookmark').create({feedId, creatorId});
      dispatch(addFeedBookmark(feedId));
    } catch(err) {
      console.log(err);
      dispatchAlertError(dispatch, err.message);
    }
  };
}

export function removeBookmarkToFeed(feedId: string, creatorId: string) {
  return async (dispatch: Dispatch): Promise<any> => {
    try {
      // await client.service('feedBookmark').create({feedId, creatorId});
      dispatch(removeFeedBookmark(feedId));
    } catch(err) {
      console.log(err);
      dispatchAlertError(dispatch, err.message);
    }
  };
}