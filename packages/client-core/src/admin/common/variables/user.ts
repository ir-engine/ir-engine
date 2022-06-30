export interface UserColumn {
  id: 'name' | 'avatarId' | 'userRole' | 'location' | 'inviteCode' | 'instanceId' | 'action'
  label: string
  minWidth?: number
  align?: 'right'
}

export const userColumns: UserColumn[] = [
  { id: 'name', label: 'Name', minWidth: 65 },
  { id: 'avatarId', label: 'Avatar', minWidth: 65 },
  {
    id: 'userRole',
    label: 'Role',
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
  el: any
  name: string
  avatarId: string | JSX.Element
  userRole: string | JSX.Element
  location: string | JSX.Element
  inviteCode: string | JSX.Element
  instanceId: string | JSX.Element
  action: any
}
export interface UserProps {
  className?: string
  removeUserAdmin?: any
  authState?: any
  adminUserState?: any
  fetchUsersAsAdmin?: any
  search: string
}

export interface UserTabPanelProps {
  children?: React.ReactNode
  index: any
  value: any
}
