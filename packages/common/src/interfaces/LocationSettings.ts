export interface LocationSettings {
  id: string
  locationId: string
  locationType: 'private' | 'public' | 'showroom'
  audioEnabled: boolean
  screenSharingEnabled: boolean
  faceStreamingEnabled: boolean
  videoEnabled: boolean
}
