import { connectToServer } from "@xr3ngine/engine/src/networking/functions/connectToServer";
import { Dispatch } from 'redux';
import io from 'socket.io-client';
import { client } from '../feathers';
import {
  instanceServerConnected,
  instanceServerProvisioned,
  socketCreated
} from './actions';
import store from "../store";
import getConfig from "next/config";

const { publicRuntimeConfig } = getConfig();
const gameserver = process.env.NODE_ENV === 'production' ? publicRuntimeConfig.gameserver : 'https://localhost:3030';

export function provisionInstanceServer (locationId: string, instanceId?: string) {
  return async (dispatch: Dispatch, getState: any): Promise<any> => {
    try {
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
      const token = getState().get('auth').get('authUser').accessToken;
      const instanceConnectionState = getState().get('instanceConnection');
      const instance = instanceConnectionState.get('instance');
      const locationId = instanceConnectionState.get('locationId');
      let socket;
      console.log('Connect to instance server');
      console.log(instance);
      if (process.env.NODE_ENV === 'development') {
        socket = io(`${instance.get('ipAddress') as string}:${instance.get('port') as string}`, {
          query: {
            locationId: locationId,
            token: token
          }
        });
      } else {
        socket = io(gameserver, {
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
      dispatch(socketCreated(socket));
    } catch (err) {
      console.log(err);
    }
  };
}

client.service('instance-provision').on('created', (params) => {
  console.log('instance-provision created listener')
  console.log(params)
  store.dispatch(instanceServerProvisioned(params, params.locationId));
});