import { Dispatch } from 'redux';
import { MediaStreamSystem } from "@xr3ngine/engine/src/networking/systems/MediaStreamSystem";
import {
  setChannelTypeState
} from './actions';

export const updateChannelTypeState = () => {
  const ms = MediaStreamSystem.instance;
  if (!ms) changeChannelTypeState('', '');

  return changeChannelTypeState((ms as any).channelType, (ms as any).channelId);
}

export const changeChannelTypeState = (channelType: string, channelId: string) => {
  return (dispatch: Dispatch): void => { dispatch(setChannelTypeState(channelType, channelId)); }
}