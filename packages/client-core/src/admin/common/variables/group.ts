export interface Column {
  id: 'name' | 'description' | 'action'
  label: string
  minWidth?: number
  align?: 'right'
}

export const columns: Column[] = [
  { id: 'name', label: 'Name', minWidth: 65 },
  { id: 'description', label: 'Description', minWidth: 65 },
  {
    id: 'action',
    label: 'Action',
    minWidth: 65,
    align: 'right'
  }
]

export interface Data {
  id: string
  name: string
  description: string
  action: any
}
