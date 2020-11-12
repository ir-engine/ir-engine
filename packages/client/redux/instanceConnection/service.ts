import { connectToServer } from "@xr3ngine/engine/src/networking/functions/connectToServer";
import { Network } from "@xr3ngine/engine/src/networking/components/Network";
import { MediaStreamComponent } from "@xr3ngine/engine/src/networking/components/MediaStreamComponent";
import { Dispatch } from 'redux';
import { client } from '../feathers';
import {
  instanceServerConnecting,
  instanceServerConnected,
  instanceServerProvisioning,
  instanceServerProvisioned,
} from './actions';
import store from "../store";
import { endVideoChat, leave } from "../../classes/transports/WebRTCFunctions";

export function provisionInstanceServer (locationId: string, instanceId?: string, sceneId?: string) {
  return async (dispatch: Dispatch, getState: any): Promise<any> => {
      dispatch(instanceServerProvisioning());
      const token = getState().get('auth').get('authUser').accessToken;
      console.log(`Provisioning instance server for location ${locationId} and instance ${instanceId}`);
      const provisionResult = await client.service('instance-provision').find({
        query: {
          locationId: locationId,
          instanceId: instanceId,
          sceneId: sceneId,
          token: token
        }
      });
      console.log(provisionResult);
      if (provisionResult.ipAddress != null && provisionResult.port != null) {
        dispatch(instanceServerProvisioned(provisionResult, locationId, sceneId));
      }
  };
}

export function connectToInstanceServer () {
  return async (dispatch: Dispatch, getState: any): Promise<any> => {
    try {
      dispatch(instanceServerConnecting());
      console.log("connectToInstanceServer");
      const authState = getState().get('auth');
      const user = authState.get('user');
      const token = authState.get('authUser').accessToken;
      const instanceConnectionState = getState().get('instanceConnection');
      const instance = instanceConnectionState.get('instance');
      const locationId = instanceConnectionState.get('locationId');
      const locationState = getState().get('locations');
      const currentLocation = locationState.get('currentLocation').get('location');
      const sceneId = currentLocation.sceneId;
      const videoActive = MediaStreamComponent.instance !== null && MediaStreamComponent.instance !== undefined && (MediaStreamComponent.instance.camVideoProducer != null || MediaStreamComponent.instance.camAudioProducer != null);
      // TODO: Disconnected 
      if(Network.instance !== undefined && Network.instance !== null){
        await endVideoChat();
        await leave();
      }
      await connectToServer(instance.get('ipAddress'), instance.get('port'), {
        locationId: locationId,
        token: token,
        sceneId: sceneId,
        startVideo: videoActive,
        partyId: user.partyId,
        videoEnabled: currentLocation?.locationSettings?.videoEnabled === true || !(currentLocation?.locationSettings?.locationType === 'showroom' && user.locationAdmins?.find(locationAdmin => locationAdmin.locationId === currentLocation.id) == null)
      });
      // setClient(instanceClient);
      dispatch(instanceServerConnected());
      // dispatch(socketCreated(socket));
    } catch (err) {
      console.log(err);
    }
  };
}

client.service('instance-provision').on('created', (params) => {
  console.log('instance-provision created listener');
  console.log(params);
  store.dispatch(instanceServerProvisioned(params, params.locationId, params.sceneId));
});