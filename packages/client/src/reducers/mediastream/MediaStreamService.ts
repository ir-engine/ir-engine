import { Dispatch } from 'redux'
import { MediaStreams } from '@xrengine/engine/src/networking/systems/MediaStreamSystem'
import { MediaStreamAction } from './MediaStreamActions'
import Store from '@xrengine/client-core/src/store'

const store = Store.store

export const MediaStreamService = {
  updateCamVideoState: () => {
    const ms = MediaStreams.instance
    if (!ms) MediaStreamService.changeCamVideoState(false)

    store.dispatch(MediaStreamAction.setCamVideoState(ms != null && ms.camVideoProducer != null && !ms.videoPaused))
  },
  changeCamVideoState: (isEnable: boolean) => {
    return (dispatch: Dispatch): void => {
      dispatch(MediaStreamAction.setCamVideoState(isEnable))
    }
  },
  triggerUpdateConsumers: () => {
    const ms = MediaStreams.instance
    if (!ms) MediaStreamService.updateConsumers([])

    store.dispatch(MediaStreamAction.setConsumers(ms != null ? ms.consumers : []))
  },
  updateConsumers: (consumers: any[]) => {
    return (dispatch: Dispatch): void => {
      dispatch(MediaStreamAction.setConsumers(consumers))
    }
  },
  triggerUpdateNearbyLayerUsers: () => {
    const ms = MediaStreams.instance
    if (!ms) MediaStreamService.updateNearbyLayerUsers([])

    store.dispatch(MediaStreamAction.setNearbyLayerUsers(ms != null ? ms.nearbyLayerUsers : []))
  },
  updateNearbyLayerUsers: (users: any[]) => {
    return (dispatch: Dispatch): void => {
      dispatch(MediaStreamAction.setNearbyLayerUsers(users))
    }
  },
  updateCamAudioState: () => {
    const ms = MediaStreams.instance
    if (!ms) MediaStreamService.changeCamAudioState(false)

    store.dispatch(MediaStreamAction.setCamAudioState(ms != null && ms.camAudioProducer != null && !ms.audioPaused))
  },
  changeCamAudioState: (isEnable: boolean) => {
    return (dispatch: Dispatch): void => {
      dispatch(MediaStreamAction.setCamAudioState(isEnable))
    }
  },
  updateFaceTrackingState: () => {
    const ms = MediaStreams.instance
    store.dispatch(MediaStreamAction.setFaceTrackingState(ms && ms.faceTracking))
  },
  changeFaceTrackingState: (isEnable: boolean) => {
    return (dispatch: Dispatch): void => {
      dispatch(MediaStreamAction.setFaceTrackingState(isEnable))
    }
  }
}
