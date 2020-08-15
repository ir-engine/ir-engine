import { Dispatch } from 'redux'
import { client } from '../feathers'
import {
  instanceServerConnected,
  instanceServerProvisioned
} from './actions'
import io from 'socket.io-client'
import feathers from '@feathersjs/client'
import { setClient } from '../feathers-instance'

export function provisionInstanceServer (locationId: string) {
  return async (dispatch: Dispatch, getState: any): Promise<any> => {
    try {
      const provisionResult = await client.service('instance-provision').find({
        query: {
          locationId: locationId
        }
      })
      console.log(provisionResult)
      if (provisionResult.ipAddress != null && provisionResult.port != null) {
        dispatch(instanceServerProvisioned(provisionResult, locationId))
      }
    } catch (err) {
      console.log(err)
    }
  }
}

export function connectToInstanceServer () {
  return async (dispatch: Dispatch, getState: any): Promise<any> => {
    try {
      const token = getState().get('auth').get('authUser').accessToken
      const instanceConnectionState = getState().get('instanceConnection')
      const instance = instanceConnectionState.get('instance')
      const locationId = instanceConnectionState.get('locationId')
      console.log('Connecting to gameserver')
      const socket = io(`${instance.get('ipAddress') as string}:${instance.get('port') as string}`, { query: { locationId: locationId, token: token } })
      console.log(socket)
      const instanceClient = feathers()
      console.log(instanceClient)
      instanceClient.configure(feathers.socketio(socket, { timeout: 10000 }))
      setClient(instanceClient)
      dispatch(instanceServerConnected())
    } catch (err) {
      console.log(err)
    }
  }
}
