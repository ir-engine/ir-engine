import Immutable from 'immutable'
import {
  InstanceServerAction,
  InstanceServerProvisionedAction
} from './actions'

import {
  INSTANCE_SERVER_CONNECTED,
  INSTANCE_SERVER_DISCONNECTED,
  INSTANCE_SERVER_PROVISIONED
} from '../actions'

export const initialState = {
  instance: {
    ipAddress: '',
    port: ''
  },
  locationId: '',
  instanceProvisioned: false,
  connected: false,
  readyToConnect: false
}

const immutableState = Immutable.fromJS(initialState)

const instanceConnectionReducer = (state = immutableState, action: InstanceServerAction): any => {
  let newValues, newInstance, newClient
  switch (action.type) {
    case INSTANCE_SERVER_PROVISIONED:
      newInstance = new Map(state.get('instance'))
      console.log(newInstance)
      newValues = (action as InstanceServerProvisionedAction)
      console.log(newValues)
      newInstance.set('ipAddress', newValues.ipAddress)
      newInstance.set('port', newValues.port)
      console.log(newInstance)
      return state
        .set('instance', newInstance)
        .set('locationId', newValues.locationId)
        .set('instanceProvisioned', true)
        .set('readyToConnect', true)
    case INSTANCE_SERVER_CONNECTED:
      return state
        .set('connected', true)
        .set('updateNeeded', false)
        .set('readyToConnect', false)
    case INSTANCE_SERVER_DISCONNECTED:
      return state
        .set('instance', initialState.instance)
        .set('locationId', initialState.locationId)
        .set('connected', false)
        .set('instanceProvisioned', false)
  }

  return state
}

export default instanceConnectionReducer
