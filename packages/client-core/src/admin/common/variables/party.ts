export interface PartyPropsTable {
  className?: string
  search: string
}

export interface PartyColumn {
  id: 'id' | 'maxMembers' | 'action'
  label: string
  minWidth?: number
  align?: 'right'
}

export const partyColumns: PartyColumn[] = [
  { id: 'id', label: 'ID', minWidth: 65 },
  { id: 'maxMembers', label: 'Max Members', minWidth: 65 },
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
  instance?: string
  maxMembers: number
  action: any
}
