export interface Column {
  id: 'name' | 'description' | 'action'
  label: string
  minWidth?: number
  align?: 'right'
}

export const columns: Column[] = [
  { id: 'name', label: 'Name', minWidth: 170 },
  { id: 'group', label: 'GroupName', minWidth: 100 },
  { id: 'user', label: 'User', minWidth: 100 },
  { id: 'action', label: 'Action', minWidth: 170, align: 'right' }
]

export interface Data {
  id: string
  name: string
  group: string
  user: string
  action: any
}
