import { UserId } from './UserId'

export interface RecordingResult {
  id: string
  userId: UserId
  ended: boolean
  schema: string
}

export interface RecordingResourceResult {
  id: string
  recordingId: string
  staticResourceId: string
}
