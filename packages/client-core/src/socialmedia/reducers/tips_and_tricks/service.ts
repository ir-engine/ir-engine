/**
 * @author Gleb Ordinsky <glebordinskijj@gmail.com>
 */
import { Dispatch } from 'redux';
import { dispatchAlertError } from '../../../common/reducers/alert/service';
import { client } from '../../../feathers';
import Api from '../../../world/components/editor/Api';
import {
  addTipsAndTricks,
  fetchingTipsAndTricks,
  tips_and_tricksRetrieved,
  deleteTipsAndTricks,
  updateTipsAndTricksInList
} from './actions'




// export function getTipsAndTricks(tips_and_tricksId: string) {
export function getTipsAndTricks() {
  return async (dispatch: Dispatch): Promise<any> => {
    try {
      dispatch(fetchingTipsAndTricks());
      const tips_and_tricks = await client.service('tips-and-tricks').find();
      dispatch(tips_and_tricksRetrieved(tips_and_tricks.data));
    } catch (err) {
      console.log(err);
      dispatchAlertError(dispatch, err.message);
    }
  };
}

export function createTipsAndTricksNew(data) {
  return async (dispatch: Dispatch): Promise<any> => {
    try {
      const api = new Api();
      const storedVideo = await api.upload(data.videoUrl, null);
      console.log(storedVideo)
      const tips_and_tricks = await client.service('tips-and-tricks').create(data);
      dispatch(addTipsAndTricks(tips_and_tricks));
    } catch (err) {
      console.log(err);
      dispatchAlertError(dispatch, err.message);
    }
  };
}


export function updateTipsAndTricksAsAdmin(tips_and_tricks: any) {
  return async (dispatch: Dispatch): Promise<any> => {
    try {
      // if (tips_and_tricks.videoUrl) {
      //   const api = new Api();
      //   const storedVideo = await api.upload(tips_and_tricks.video, null);
      //   //@ts-ignore error that this vars are void bacause upload is defines as voin funtion
      //   tips_and_tricks.videoId = storedVideo.file_id;
      //   delete tips_and_tricks.videoUrl;
      // }
      await client.service('tips-and-tricks').patch(tips_and_tricks.id, tips_and_tricks);
      dispatch(updateTipsAndTricksInList(tips_and_tricks));
    } catch (err) {
      console.log(err);
      dispatchAlertError(dispatch, err.message);
    }
  };
}


export function removeTipsAndTricks(tips_and_tricksId: string) {
  return async (dispatch: Dispatch): Promise<any> => {
    try {
      await client.service('tips-and-tricks').remove(tips_and_tricksId);
      dispatch(deleteTipsAndTricks(tips_and_tricksId));
    } catch (err) {
      console.log(err);
      dispatchAlertError(dispatch, err.message);
    }
  };
}
