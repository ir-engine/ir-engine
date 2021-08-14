export interface Column {
  id: 'name' | 'description' | 'state' | 'attribution' | 'creator' | 'action'
  label: string
  minWidth?: number
  align?: 'right'
}

export const columns: Column[] = [
  { id: 'name', label: 'Name', minWidth: 150 },
  { id: 'description', label: 'Description', minWidth: 100 },
  {
    id: 'state',
    label: 'State',
    minWidth: 150,
    align: 'right'
  },
  {
    id: 'attribution',
    label: 'Attribution',
    minWidth: 150,
    align: 'right'
  },
  {
    id: 'creator',
    label: 'Creator',
    minWidth: 150,
    align: 'right'
  },
  {
    id: 'action',
    label: 'Action',
    minWidth: 150,
    align: 'right'
  }
]

export interface Data {
  id: string
  name: string
  description: string
  state: string
  attribution: string
  creator: any
  action: any
}
