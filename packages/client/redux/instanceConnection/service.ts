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

export function provisionInstanceServer (locationId: string, instanceId?: string) {
  return async (dispatch: Dispatch, getState: any): Promise<any> => {
    try {
      dispatch(instanceServerProvisioning());
      const token = getState().get('auth').get('authUser').accessToken;
      console.log(`Provisioning instance server for location ${locationId} and instance ${instanceId}`);
      const provisionResult = await client.service('instance-provision').find({
        query: {
          locationId: locationId,
          instanceId: instanceId,
          token: token
        }
      });
      console.log(provisionResult);
      if (provisionResult.ipAddress != null && provisionResult.port != null) {
        dispatch(instanceServerProvisioned(provisionResult, locationId));
      }
    } catch (err) {
      console.log(err);
    }
  };
}

export function connectToInstanceServer () {
  return async (dispatch: Dispatch, getState: any): Promise<any> => {
    try {
      dispatch(instanceServerConnecting());
      const authState = getState().get('auth');
      const user = authState.get('user');
      console.log('USERUSER:');
      console.log(user);
      const token = authState.get('authUser').accessToken;
      const instanceConnectionState = getState().get('instanceConnection');
      const instance = instanceConnectionState.get('instance');
      const locationId = instanceConnectionState.get('locationId');
      const locationState = getState().get('locations');
      const currentLocation = locationState.get('currentLocation').get('location');
      console.log('Connect to instance server');
      const videoActive = MediaStreamComponent.instance.camVideoProducer != null || MediaStreamComponent.instance.camAudioProducer != null;
      // await (Network.instance.transport as any).endVideoChat();
      // await (Network.instance.transport as any).leave();
      await connectToServer(instance.get('ipAddress'), instance.get('port'), {
        locationId: locationId,
        token: token,
        startVideo: videoActive,
        videoEnabled: !(currentLocation.locationType === 'showroom' && user.locationAdmins?.find(locationAdmin => locationAdmin.locationId === currentLocation.id) == null)
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
  store.dispatch(instanceServerProvisioned(params, params.locationId));
});