import Immutable from 'immutable';
import {
  InstanceServerAction,
  InstanceServerProvisionedAction,
  SocketCreatedAction
} from './actions';

import {
  INSTANCE_SERVER_CONNECTING,
  INSTANCE_SERVER_CONNECTED,
  INSTANCE_SERVER_DISCONNECTED,
  INSTANCE_SERVER_PROVISIONING,
  INSTANCE_SERVER_PROVISIONED,
  SOCKET_CREATED
} from '../actions';

export const initialState = {
  instance: {
    ipAddress: '',
    port: ''
  },
  socket: {},
  locationId: '',
  instanceProvisioned: false,
  connected: false,
  readyToConnect: false,
  updateNeeded: false,
  instanceServerConnecting: false,
  instanceProvisioning: false
};

let connectionSocket = null;

const immutableState = Immutable.fromJS(initialState);

const instanceConnectionReducer = (state = immutableState, action: InstanceServerAction): any => {
  let newValues, newInstance, newClient;
  switch (action.type) {
    case INSTANCE_SERVER_PROVISIONING:
      return state
          .set('instance', new Map(Object.entries(initialState.instance)))
          .set('socket', {})
          .set('connected', false)
          .set('instanceProvisioned', false)
          .set('readyToConnect', false)
          .set('instanceProvisioning', true);
    case INSTANCE_SERVER_PROVISIONED:
      newInstance = new Map(state.get('instance'));
      console.log(newInstance);
      newValues = (action as InstanceServerProvisionedAction);
      console.log(newValues);
      newInstance.set('ipAddress', newValues.ipAddress);
      newInstance.set('port', newValues.port);
      console.log(newInstance);
      return state
        .set('instance', newInstance)
        .set('locationId', newValues.locationId)
        .set('instanceProvisioning', false)
        .set('instanceProvisioned', true)
        .set('readyToConnect', true)
        .set('updateNeeded', true);
    case INSTANCE_SERVER_CONNECTING:
      return state
          .set('instanceServerConnecting', true);
    case INSTANCE_SERVER_CONNECTED:
      return state
        .set('connected', true)
        .set('instanceServerConnecting', false)
        .set('updateNeeded', false)
        .set('readyToConnect', false);
    case INSTANCE_SERVER_DISCONNECTED:
      return state
        .set('instance', new Map(Object.entries(initialState.instance)))
        .set('locationId', initialState.locationId)
        .set('connected', false)
        .set('instanceProvisioned', false);
    case SOCKET_CREATED:
      console.log(connectionSocket);
      console.log(action);
      if (connectionSocket != null) {
        (connectionSocket as any).close();
      }
      connectionSocket = (action as SocketCreatedAction).socket;
      return state;
  }

  return state;
};

export default instanceConnectionReducer;
