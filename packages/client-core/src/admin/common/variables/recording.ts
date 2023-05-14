export interface RecordingColumn {
  id: 'id' | 'user' | 'ended' | 'schema' | 'action'
  label: string
  minWidth?: number
  align?: 'right'
}

export const recordingColumns: RecordingColumn[] = [
  { id: 'id', label: 'Recording ID' },
  { id: 'user', label: 'User' },
  { id: 'ended', label: 'Ended' },
  {
    id: 'schema',
    label: 'Schema',
    align: 'right'
  },
  {
    id: 'action',
    label: 'Action',
    align: 'right'
  }
]
