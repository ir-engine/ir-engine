export interface BuildStatus {
  id: number
  status: string
  dateStarted: string
  dateEnded: string
  logs: string
  commitSHA: string
}
