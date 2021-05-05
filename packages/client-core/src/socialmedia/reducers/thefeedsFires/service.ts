/**
 * @author Gleb Ordinsky <glebordinskijj@gmail.com>
 */
import { Dispatch } from 'redux';
import { dispatchAlertError } from "../../../common/reducers/alert/service";
import { client } from '../../../feathers';
import {
  fetchingTheFeedsFires,
  thefeedsFiresRetrieved
} from './actions';
import {
  addTheFeedsFire, removeTheFeedsFire
} from '../thefeeds/actions';


// thefeeds
// TheFeeds
// THEFEEDS

export function getTheFeedsFires(thefeedsId : string) {
  return async (dispatch: Dispatch, getState: any): Promise<any> => {
    try {
      dispatch(fetchingTheFeedsFires());
      const thefeedsResults = await client.service('thefeeds-fires').find({query: {thefeedsId: thefeedsId}});
      dispatch(thefeedsFiresRetrieved(thefeedsResults.data));
    } catch(err) {
      console.log(err);
      dispatchAlertError(dispatch, err.message);
    }
  };
}


export function addFireToTheFeeds(thefeedsId: string) {
  return async (dispatch: Dispatch): Promise<any> => {
    try {
      await client.service('thefeeds-fires').create({thefeedsId});
      dispatch(addTheFeedsFire(thefeedsId));
    } catch(err) {
      console.log(err);
      dispatchAlertError(dispatch, err.message);
    }
  };
}

export function removeFireToTheFeeds(thefeedsId: string) {
  return async (dispatch: Dispatch): Promise<any> => {
    try {
      await client.service('thefeeds-fires').remove(thefeedsId);
      dispatch(removeTheFeedsFire(thefeedsId));
    } catch(err) {
      console.log(err);
      dispatchAlertError(dispatch, err.message);
    }
  };
}