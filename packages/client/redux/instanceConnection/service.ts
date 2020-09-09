import { connectToServer } from "@xr3ngine/engine/src/networking/functions/connectToServer";
import { Dispatch } from 'redux';
import io from 'socket.io-client';
import { client } from '../feathers';
import {
  instanceServerConnected,
  instanceServerProvisioned
} from './actions';

export function provisionInstanceServer (locationId: string) {
  return async (dispatch: Dispatch, getState: any): Promise<any> => {
    try {
      const token = getState().get('auth').get('authUser').accessToken;
      const provisionResult = await client.service('instance-provision').find({
        query: {
          locationId: locationId,
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
      const token = getState().get('auth').get('authUser').accessToken;
      const instanceConnectionState = getState().get('instanceConnection');
      const instance = instanceConnectionState.get('instance');
      const locationId = instanceConnectionState.get('locationId');
      let socket;
      if (process.env.NODE_ENV === 'development') {
        socket = io(`${instance.get('ipAddress') as string}:${instance.get('port') as string}`, {
          query: {
            locationId: locationId,
            token: token
          }
        });
      } else {
        socket = io('https://gameserver.xrengine.io', {
          path: `/socket.io/${instance.get('ipAddress') as string}/${instance.get('port') as string}`,
          query: {
            locationId: locationId,
            token: token
          }
        });
      }
      // const instanceClient = feathers();
      // instanceClient.configure(feathers.socketio(socket, { timeout: 10000 }));
      connectToServer(instance.get('ipAddress'), instance.get('port'));
      // setClient(instanceClient);
      dispatch(instanceServerConnected());
    } catch (err) {
      console.log(err);
    }
  };
}
