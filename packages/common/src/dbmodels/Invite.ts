export interface InviteInterface {
  id: string
  token: string
  identityProviderType: string
  passcode: string
  targetObjectId: string
  deleteOnUse: boolean
  makeAdmin: boolean
  spawnType: string
  spawnDetails: object
  timed?: boolean
  startTime?: string
  endTime?: string
}
