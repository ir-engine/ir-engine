import { Dispatch } from 'redux'
import { MediaStreams } from '@xrengine/engine/src/networking/systems/MediaStreamSystem'
import { setCamAudioState, setCamVideoState, setFaceTrackingState, setConsumers, setNearbyLayerUsers } from './actions'
import Store from '@xrengine/client-core/src/store'

const store = Store.store

export const updateCamVideoState = () => {
  const ms = MediaStreams.instance
  if (!ms) changeCamVideoState(false)

  store.dispatch(setCamVideoState(ms != null && ms.camVideoProducer != null && !ms.videoPaused))
}

export const changeCamVideoState = (isEnable: boolean) => {
  return (dispatch: Dispatch): void => {
    dispatch(setCamVideoState(isEnable))
  }
}

export const triggerUpdateConsumers = () => {
  const ms = MediaStreams.instance
  if (!ms) updateConsumers([])

  store.dispatch(setConsumers(ms != null ? ms.consumers : []))
}

export const updateConsumers = (consumers: any[]) => {
  return (dispatch: Dispatch): void => {
    dispatch(setConsumers(consumers))
  }
}

export const triggerUpdateNearbyLayerUsers = () => {
  const ms = MediaStreams.instance
  if (!ms) updateNearbyLayerUsers([])

  store.dispatch(setNearbyLayerUsers(ms != null ? ms.nearbyLayerUsers : []))
}

export const updateNearbyLayerUsers = (users: any[]) => {
  return (dispatch: Dispatch): void => {
    dispatch(setNearbyLayerUsers(users))
  }
}

export const updateCamAudioState = () => {
  const ms = MediaStreams.instance
  if (!ms) changeCamAudioState(false)

  store.dispatch(setCamAudioState(ms != null && ms.camAudioProducer != null && !ms.audioPaused))
}

export const changeCamAudioState = (isEnable: boolean) => {
  return (dispatch: Dispatch): void => {
    dispatch(setCamAudioState(isEnable))
  }
}

export const updateFaceTrackingState = () => {
  const ms = MediaStreams.instance
  store.dispatch(setFaceTrackingState(ms && ms.faceTracking))
}

export const changeFaceTrackingState = (isEnable: boolean) => {
  return (dispatch: Dispatch): void => {
    dispatch(setFaceTrackingState(isEnable))
  }
}
