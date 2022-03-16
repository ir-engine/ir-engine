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
  el: any
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
  search: string
}

export interface UserTabPanelProps {
  children?: React.ReactNode
  index: any
  value: any
}

export const userFilterMenu = {
  elevation: 0,
  sx: {
    overflow: 'visible',
    filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
    mt: 1.5,
    '& .MuiAvatar-root': {
      width: 32,
      height: 32,
      ml: -0.5,
      mr: 1
    },
    bgcolor: 'rgb(58, 65, 73) !important',
    '&:before': {
      content: '""',
      display: 'block',
      position: 'absolute',
      top: 0,
      right: 14,
      width: 10,
      height: 10,
      bgcolor: 'rgb(58, 65, 73) !important',
      transform: 'translateY(-50%) rotate(45deg)',
      zIndex: 0
    }
  }
}
