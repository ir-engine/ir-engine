export interface Props {
  open: boolean
  handleClose: any
  fetchAdminLocations?: any
  adminState?: any
  authState?: any
  fetchAdminInstances?: any
  createAdminParty?: any
  adminInstanceState?: any
  adminLocationState?: any
}

export interface PropsTable {
  fetchAdminParty?: any
  adminState?: any
  authState?: any
  adminPartyState?: any
}

export interface Column {
  id: 'instance' | 'location' | 'action'
  label: string
  minWidth?: number
  align?: 'right'
}

export const columns: Column[] = [
  { id: 'instance', label: 'Instance', minWidth: 170 },
  { id: 'location', label: 'Location', minWidth: 100 },
  {
    id: 'action',
    label: 'Action',
    minWidth: 170,
    align: 'right'
  }
]

export interface Data {
  id: string
  instance: string
  location: string
  action: any
}
