import { ServerPodInfo } from '@etherealengine/common/src/interfaces/ServerInfo'

export interface ServerColumn {
  id: string
  label: JSX.Element
  minWidth?: number
  align?: 'right'
}

export interface ServerPodData {
  el: ServerPodInfo
  name: string
  status: string
  type: string
  currentUsers: string
  age: string
  containers: JSX.Element
  restarts: string
  instanceId: JSX.Element
  action: JSX.Element
}
