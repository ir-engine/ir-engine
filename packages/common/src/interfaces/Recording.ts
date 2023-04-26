import { UserId } from './UserId'

export interface RecordingResult {
  id: string
  userId: UserId
  ended: boolean
  schema: string
  resources?: Array<string> // storage provider keys
}

export interface RecordingResourceResult {
  id: string
  recordingId: string
  staticResourceId: string
}
