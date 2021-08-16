export interface Column {
  id: 'name' | 'avatar' | 'status' | 'location' | 'inviteCode' | 'instanceId' | 'action'
  label: string
  minWidth?: number
  align?: 'right'
}

export const columns: Column[] = [
  { id: 'name', label: 'Name', minWidth: 170 },
  { id: 'avatar', label: 'Avatar', minWidth: 100 },
  {
    id: 'status',
    label: 'Status',
    minWidth: 170,
    align: 'right'
  },
  {
    id: 'location',
    label: 'Location',
    minWidth: 170,
    align: 'right'
  },
  {
    id: 'inviteCode',
    label: 'Invite code',
    minWidth: 170,
    align: 'right'
  },
  {
    id: 'instanceId',
    label: 'Instance',
    minWidth: 170,
    align: 'right'
  },
  {
    id: 'action',
    label: 'Action',
    minWidth: 170,
    align: 'right'
  }
]

export interface Data {
  id: string
  user: any
  name: string
  avatar: string
  status: string
  location: string
  inviteCode: string
  instanceId: string
  action: any
}
export interface Props {
  removeUserAdmin?: any
  authState?: any
  adminUserState?: any
  fetchUsersAsAdmin?: any
}

export interface TabPanelProps {
  children?: React.ReactNode
  index: any
  value: any
}
