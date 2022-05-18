export interface PartyProps {
  open: boolean
  handleClose: () => void
}

export interface PartyPropsTable {
  search: string
}

export interface PartyColumn {
  id: 'instance' | 'location' | 'action'
  label: string
  minWidth?: number
  align?: 'right'
}

export const partyColumns: PartyColumn[] = [
  { id: 'instance', label: 'Instance', minWidth: 65 },
  { id: 'location', label: 'Location', minWidth: 65 },
  {
    id: 'action',
    label: 'Action',
    minWidth: 65,
    align: 'right'
  }
]

export interface PartyData {
  el: any
  id: string
  instance: string
  location: string
  action: any
}
