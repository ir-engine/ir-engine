import { MediaStreams } from '@xrengine/engine/src/networking/systems/MediaStreamSystem'
import { MediaStreamAction } from './MediaStreamActions'
import { store } from '../../store'

export const MediaStreamService = {
  updateCamVideoState: () => {
    const ms = MediaStreams.instance
    store.dispatch(MediaStreamAction.setCamVideoState(ms != null && ms.camVideoProducer != null && !ms.videoPaused))
  },
  triggerUpdateConsumers: () => {
    const ms = MediaStreams.instance
    store.dispatch(MediaStreamAction.setConsumers(ms != null ? ms.consumers : []))
  },
  triggerUpdateNearbyLayerUsers: () => {
    const ms = MediaStreams.instance
    store.dispatch(MediaStreamAction.setNearbyLayerUsers(ms != null ? ms.nearbyLayerUsers : []))
  },
  updateCamAudioState: () => {
    const ms = MediaStreams.instance
    store.dispatch(MediaStreamAction.setCamAudioState(ms != null && ms.camAudioProducer != null && !ms.audioPaused))
  },
  updateFaceTrackingState: () => {
    const ms = MediaStreams.instance
    store.dispatch(MediaStreamAction.setFaceTrackingState(ms && ms.faceTracking))
  }
}
