import { MediaStreamSystem } from "@xr3ngine/engine/src/networking/systems/MediaStreamSystem";
import { Network } from "@xr3ngine/engine/src/networking/classes/Network";
import { Dispatch } from 'redux';
import { endVideoChat, leave } from "@xr3ngine/engine/src/networking/functions/SocketWebRTCClientFunctions";
import { client } from '../feathers';
import store from "../store";
import {
  instanceServerConnected,
  instanceServerConnecting,
  instanceServerProvisioned,
  instanceServerProvisioning
} from './actions';

export function provisionInstanceServer(locationId?: string, instanceId?: string, sceneId?: string, channelId?: string) {
  return async (dispatch: Dispatch, getState: any): Promise<any> => {
    dispatch(instanceServerProvisioning());
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
    const queryParams = channelId != null ? {
      query: {
        channelId: channelId,
        token: token
      }
    } : {
      query: {
        locationId: locationId,
        instanceId: instanceId,
        sceneId: sceneId,
        token: token
      }
    };
    console.log('instance provision queryParams:');
    console.log(queryParams);
    const provisionResult = await client.service('instance-provision').find(queryParams);
    console.log('Provision result:');
    console.log(provisionResult);
    if (provisionResult.ipAddress != null && provisionResult.port != null) {
      dispatch(instanceServerProvisioned(provisionResult, locationId, sceneId, channelId));
    }
  };
}

export function connectToInstanceServer(channelType: string, channelId?: string) {
  return async (dispatch: Dispatch, getState: any): Promise<any> => {
    try {
      dispatch(instanceServerConnecting());
      console.log('connectToInstanceServer: ', channelType, channelId);
      const authState = getState().get('auth');
      const user = authState.get('user');
      const token = authState.get('authUser').accessToken;
      const instanceConnectionState = getState().get('instanceConnection');
      const instance = instanceConnectionState.get('instance');
      const locationId = instanceConnectionState.get('locationId');
      const locationState = getState().get('locations');
      const currentLocation = locationState.get('currentLocation').get('location');
      const sceneId = currentLocation.sceneId;
      const videoActive = MediaStreamSystem !== null && MediaStreamSystem !== undefined && (MediaStreamSystem.camVideoProducer != null || MediaStreamSystem.camAudioProducer != null);
      // TODO: Disconnected 
      if (Network.instance !== undefined && Network.instance !== null) {
        await endVideoChat({ endConsumers: true });
        await leave();
      }

      await Network.instance.transport.initialize(instance.get('ipAddress'), instance.get('port'), {
        locationId: locationId,
        token: token,
        sceneId: sceneId,
        startVideo: videoActive,
        channelType: channelType,
        channelId: channelId,
        videoEnabled: currentLocation?.locationSettings?.videoEnabled === true || !(currentLocation?.locationSettings?.locationType === 'showroom' && user.locationAdmins?.find(locationAdmin => locationAdmin.locationId === currentLocation.id) == null)
      });
      Network.instance.isInitialized = true;

      // setClient(instanceClient);
      dispatch(instanceServerConnected());
      // dispatch(socketCreated(socket));
    } catch (err) {
      console.log(err);
    }
  };
}

client.service('instance-provision').on('created', (params) => {
  store.dispatch(instanceServerProvisioned(params, params.locationId, params.sceneId, params.channelId));
});