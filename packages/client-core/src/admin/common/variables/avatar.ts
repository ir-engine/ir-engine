export interface AvatarColumn {
  id: 'sid' | 'name' | 'key' | 'action'
  label: string
  minWidth?: number
  align?: 'right'
}

export const avatarColumns: AvatarColumn[] = [
  { id: 'sid', label: 'Id', minWidth: 65 },
  { id: 'name', label: 'Name', minWidth: 65 },
  {
    id: 'key',
    label: 'Key',
    minWidth: 65,
    align: 'right'
  },
  {
    id: 'action',
    label: 'Action',
    minWidth: 65,
    align: 'right'
  }
]

export interface AvatarData {
  sid: any
  name: string
  key: string
  action: any
}
