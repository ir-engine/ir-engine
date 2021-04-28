/**
 * @author Gleb Ordinsky <glebordinskijj@gmail.com>
 */
import { Dispatch } from 'redux';
import { dispatchAlertError } from '../../../common/reducers/alert/service';
import { client } from '../../../feathers';
import Api from '../../../world/components/editor/Api';
import {
  fetchingTipsAndTricks,
  tips_and_tricksRetrieved,
  // addTipsAndTricks,
  // updateTipsAndTricksInList
} from './actions';



// export function getTipsAndTricks(tips_and_tricksId: string) {
export function getTipsAndTricks() {
  return async (dispatch: Dispatch): Promise<any> => {
    try {
      dispatch(fetchingTipsAndTricks());
      const tips_and_tricks = await client.service('tips_and_tricks').get(1);
      // const tips_and_tricks = await client.service('tips_and_tricks').get(tips_and_tricksId);
      dispatch(tips_and_tricksRetrieved(tips_and_tricks));
    } catch (err) {
      console.log(err);
      dispatchAlertError(dispatch, err.message);
    }
  };
}

export function createTipsAndTricks({ title, description, video, preview }: any) {
  return async (dispatch: Dispatch): Promise<any> => {
    try {
      const api = new Api();
      const storedVideo = await api.upload(video, null);
      const storedPreview = await api.upload(preview, null);
      //@ts-ignore error that this vars are void bacause upload is defines as voin funtion
      if (storedVideo && storedPreview) {
        //@ts-ignore error that this vars are void bacause upload is defines as voin funtion
        const tips_and_tricks = await client.service('tips_and_tricks').create({ title, description, videoId: storedVideo.file_id, previewId: storedPreview.file_id });


        // dispatch(addTipsAndTricks(tips_and_tricks));


      }
    } catch (err) {
      console.log(err);
      dispatchAlertError(dispatch, err.message);
    }
  };
}

export function updateTipsAndTricksAsAdmin(tips_and_tricksId: string, tips_and_tricks: any) {
  return async (dispatch: Dispatch): Promise<any> => {
    try {
      if (tips_and_tricks.video) {
        const api = new Api();
        const storedVideo = await api.upload(tips_and_tricks.video, null);
        //@ts-ignore error that this vars are void bacause upload is defines as voin funtion
        tips_and_tricks.videoId = storedVideo.file_id;
        delete tips_and_tricks.video;
      }
      if (tips_and_tricks.preview) {
        const api = new Api();
        const storedPreview = await api.upload(tips_and_tricks.preview, null);
        //@ts-ignore error that this vars are void bacause upload is defines as voin funtion
        tips_and_tricks.previewId = storedPreview.file_id;
        delete tips_and_tricks.preview;
      }
      //@ts-ignore error that this vars are void bacause upload is defines as voin funtion
      const updatedTipsAndTricks = await client.service('tips_and_tricks').patch(tips_and_tricksId, tips_and_tricks);


      // dispatch(updateTipsAndTricksInList(updatedTipsAndTricks));


    } catch (err) {
      console.log(err);
      dispatchAlertError(dispatch, err.message);
    }
  };
}


export function removeTipsAndTricks(tips_and_tricksId: string) {
  return async (dispatch: Dispatch): Promise<any> => {
    try {
      dispatch(fetchingTipsAndTricks());
      const tips_and_tricks = await client.service('tips_and_tricks').get(tips_and_tricksId);
      dispatch(tips_and_tricksRetrieved(tips_and_tricks));
    } catch (err) {
      console.log(err);
      dispatchAlertError(dispatch, err.message);
    }
  };
}
