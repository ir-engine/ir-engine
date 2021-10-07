export type BooleanAction = { [key: string]: boolean }
export const MediaStreamAction = {
  setCamVideoState: (isEnable: boolean) => {
    return { type: 'CAM_VIDEO_CHANGED' as const, isEnable: isEnable }
  },
  setCamAudioState: (isEnable: boolean) => {
    return { type: 'CAM_AUDIO_CHANGED' as const, isEnable }
  },
  setFaceTrackingState: (isEnable: boolean) => {
    return { type: 'FACE_TRACKING_CHANGED' as const, isEnable }
  },
  setConsumers: (consumers: any[]): any => {
    return { type: 'CONSUMERS_CHANGED' as const, consumers }
  },
  setNearbyLayerUsers: (users: any[]): any => {
    return { type: 'NEARBY_LAYER_USERS_CHANGED' as const, users }
  }
}

export type MediaStreamActionType = ReturnType<typeof MediaStreamAction[keyof typeof MediaStreamAction]>
