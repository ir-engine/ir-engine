export interface Column {
  id: 'name' | 'description' | 'type' | 'entity' | 'version' | 'action'
  label: string
  minWidth?: number
  align?: 'right'
}

export const columns: Column[] = [
  { id: 'name', label: 'Name', minWidth: 150 },
  { id: 'description', label: 'Description', minWidth: 100 },
  {
    id: 'type',
    label: 'Type',
    minWidth: 150,
    align: 'right'
  },
  {
    id: 'entity',
    label: 'Entity',
    minWidth: 150,
    align: 'right'
  },
  {
    id: 'version',
    label: 'Version',
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
  type: string
  entity: any
  version: any
  action: any
}
