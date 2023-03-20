import { UserId } from './UserId'

export interface RecordingResult {
  id: string
  userId: UserId
  ended: boolean
  schema: string
}
