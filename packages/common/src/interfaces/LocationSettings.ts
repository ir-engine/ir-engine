export interface LocationSettings {
  id: string
  locationId: string
  locationType: 'private' | 'public'
  instanceMediaChatEnabled: boolean
  audioEnabled: boolean
  screenSharingEnabled: boolean
  faceStreamingEnabled: boolean
  videoEnabled: boolean
}
