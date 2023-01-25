export interface BuildStatusColumn {
  id: 'id' | 'status' | 'dateStarted' | 'dateEnded' | 'logs' | 'commitSHA'
  label: string
  minWidth?: number
  align?: 'right' | 'center'
}

export const buildStatusColumns: BuildStatusColumn[] = [
  { id: 'id', label: 'Build #', minWidth: 65 },
  { id: 'status', label: 'Status', minWidth: 65 },
  { id: 'commitSHA', label: 'Commit SHA', minWidth: 65, align: 'center' },
  { id: 'logs', label: 'View Logs', minWidth: 65, align: 'center' },
  { id: 'dateStarted', label: 'Date Started', minWidth: 100 },
  { id: 'dateEnded', label: 'Date Ended', minWidth: 100 }
]
