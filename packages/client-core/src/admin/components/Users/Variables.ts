export interface UserColumn {
  id: 'name' | 'avatar' | 'status' | 'location' | 'inviteCode' | 'instanceId' | 'action'
  label: string
  minWidth?: number
  align?: 'right'
}

export const userColumns: UserColumn[] = [
  { id: 'name', label: 'Name', minWidth: 65 },
  { id: 'avatar', label: 'Avatar', minWidth: 65 },
  {
    id: 'status',
    label: 'Status',
    minWidth: 65,
    align: 'right'
  },
  {
    id: 'location',
    label: 'Location',
    minWidth: 65,
    align: 'right'
  },
  {
    id: 'inviteCode',
    label: 'Invite code',
    minWidth: 65,
    align: 'right'
  },
  {
    id: 'instanceId',
    label: 'Instance',
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

export interface UserData {
  id: string
  user: any
  name: string
  avatar: string | JSX.Element
  status: string | JSX.Element
  location: string | JSX.Element
  inviteCode: string | JSX.Element
  instanceId: string | JSX.Element
  action: any
}
export interface UserProps {
  removeUserAdmin?: any
  authState?: any
  adminUserState?: any
  fetchUsersAsAdmin?: any
  refetchSingleUserAdmin?: any
}

export interface UserTabPanelProps {
  children?: React.ReactNode
  index: any
  value: any
}
