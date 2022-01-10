export interface LocationColumn {
  id:
    | 'sceneId'
    | 'maxUsersPerInstance'
    | 'scene'
    | 'type'
    | 'tags'
    | 'instanceMediaChatEnabled'
    | 'videoEnabled'
    | 'action'
  label: string
  minWidth?: number
  align?: 'right' | 'center'
}

export const locationColumns: LocationColumn[] = [
  {
    id: 'scene',
    label: 'Name',
    minWidth: 65
  },
  { id: 'sceneId', label: 'Scene', minWidth: 65 },
  {
    id: 'maxUsersPerInstance',
    label: 'Max Users Per Instance',
    minWidth: 80,
    align: 'center'
  },
  {
    id: 'type',
    label: 'Type',
    minWidth: 65,
    align: 'right'
  },
  {
    id: 'tags',
    label: 'Tags',
    minWidth: 65,
    align: 'center'
  },
  {
    id: 'instanceMediaChatEnabled',
    label: 'Instance Media Chat Enabled',
    minWidth: 80,
    align: 'center'
  },
  {
    id: 'videoEnabled',
    label: 'Video Enabled',
    minWidth: 65,
    align: 'center'
  },
  {
    id: 'action',
    label: 'Action',
    minWidth: 65,
    align: 'right'
  }
]

export interface LocationData {
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

export interface LocationProps {
  authState?: any
  locationState?: any
  fetchAdminLocations?: any
  fetchAdminScenes?: any
  fetchLocationTypes?: any
  fetchUsersAsAdmin?: any
  fetchAdminInstances?: any
  adminLocationState?: any
  adminUserState?: any
  adminInstanceState?: any
  adminSceneState?: any
  removeLocation?: any
  adminScopeErrorState?: any
  search: string
}
