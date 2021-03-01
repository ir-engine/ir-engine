import { MediaStreamSystem } from "@xr3ngine/engine/src/networking/systems/MediaStreamSystem";
import { Network } from "@xr3ngine/engine/src/networking/classes/Network";
import { Dispatch } from 'redux';
import { endVideoChat, leave } from "@xr3ngine/engine/src/networking/functions/SocketWebRTCClientFunctions";
import { client } from '../feathers';
import store from "../store";
import {
  channelServerConnected,
  channelServerConnecting, 
  channelServerDisconnected,
  channelServerProvisioned,
  channelServerProvisioning
} from './actions';

export function provisionChannelServer(instanceId?: string, channelId?: string) {
  return async (dispatch: Dispatch, getState: any): Promise<any> => {
    dispatch(channelServerProvisioning());
    const token = getState().get('auth').get('authUser').accessToken;
    if (instanceId != null) {
      const instance = await client.service('instance').find({
        query: {
          id: instanceId
        }
      });
      if (instance.total === 0) {
        instanceId = null;
      }
    }
    console.log('channel provision queryParams:');
    console.log({
      query: {
        channelId: channelId,
        token: token
      }
    });
    const provisionResult = await client.service('instance-provision').find({
      query: {
        channelId: channelId,
        token: token
      }
    });
    console.log('Channel Provision result:');
    console.log(provisionResult);
    if (provisionResult.ipAddress != null && provisionResult.port != null) {
      dispatch(channelServerProvisioned(provisionResult, channelId));
    }
  };
}

export function connectToChannelServer(channelId: string) {
  return async (dispatch: Dispatch, getState: any): Promise<any> => {
    try {
      dispatch(channelServerConnecting());
      console.log('connectToInstanceServer: ', channelId);
      const authState = getState().get('auth');
      const user = authState.get('user');
      const token = authState.get('authUser').accessToken;
      const channelConnectionState = getState().get('channelConnection');
      const instance = channelConnectionState.get('instance');
      const locationId = channelConnectionState.get('locationId');
      const locationState = getState().get('locations');
      const currentLocation = locationState.get('currentLocation').get('location');
      const sceneId = currentLocation.sceneId;
      const videoActive = MediaStreamSystem !== null && MediaStreamSystem !== undefined && (MediaStreamSystem.instance?.camVideoProducer != null || MediaStreamSystem.instance?.camAudioProducer != null);
      // TODO: Disconnected 
      if (Network.instance !== undefined && Network.instance !== null) {
        await endVideoChat({ endConsumers: true });
        await leave(false);
      }

      await Network.instance.transport.initialize(instance.get('ipAddress'), instance.get('port'), false, {
        locationId: locationId,
        token: token,
        sceneId: sceneId,
        startVideo: videoActive,
        channelId: channelId,
        videoEnabled: currentLocation?.locationSettings?.videoEnabled === true || !(currentLocation?.locationSettings?.locationType === 'showroom' && user.locationAdmins?.find(locationAdmin => locationAdmin.locationId === currentLocation.id) == null)
      });
      Network.instance.isInitialized = true;
      document.dispatchEvent(new CustomEvent('server-connected'))

      // setClient(instanceClient);
      dispatch(channelServerConnected());
      // dispatch(socketCreated(socket));
    } catch (err) {
      console.log(err);
    }
  };
}

export function resetChannelServer() {
  return async (dispatch: Dispatch): Promise<any> => {
    const channelRequest = (Network.instance.transport as any).channelRequest;
    if (channelRequest != null) (Network.instance.transport as any).channelRequest = null;
    dispatch(channelServerDisconnected());
  };
}

client.service('instance-provision').on('created', (params) => {
  console.log('channelConnection instance-provision listener');
  console.log(params);
  if (params.channelId != null) store.dispatch(channelServerProvisioned(params, params.channelId));
});