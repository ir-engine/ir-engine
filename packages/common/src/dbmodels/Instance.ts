export interface InstanceInterface {
  id: string
  ipAddress: string
  channelId: string
  currentUsers: number
  ended: boolean
  assigned: boolean
  assignedAt: Date
}
