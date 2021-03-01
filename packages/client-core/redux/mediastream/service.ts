import { Dispatch } from 'redux';
import { MediaStreamSystem } from "@xr3ngine/engine/src/networking/systems/MediaStreamSystem";
import {
  setCamAudioState,
  setCamVideoState,
  setFaceTrackingState,
} from './actions';

export const updateCamVideoState = () => {
  const ms = MediaStreamSystem.instance;
  if (!ms) changeCamVideoState(false);

  return changeCamVideoState(ms.mediaStream && ms.camVideoProducer && !ms.videoPaused);
}

export const changeCamVideoState = (isEnable: boolean) => {
  return (dispatch: Dispatch): void => { dispatch(setCamVideoState(isEnable)); }
}

export const updateCamAudioState = () => {
  const ms = MediaStreamSystem.instance;
  if (!ms) changeCamAudioState(false);

  return changeCamAudioState(ms.mediaStream && ms.camAudioProducer && !ms.audioPaused);
}

export const changeCamAudioState = (isEnable: boolean) => {
  return (dispatch: Dispatch): void => { dispatch(setCamAudioState(isEnable)); }
}

export const updateFaceTrackingState = () => {
  const ms = MediaStreamSystem.instance;
  return changeFaceTrackingState(ms && ms.faceTracking)  
}

export const changeFaceTrackingState = (isEnable: boolean) => {
  return (dispatch: Dispatch): void => { dispatch(setFaceTrackingState(isEnable)); } 
}
