import { ServerPodInfo } from '@xrengine/common/src/interfaces/ServerInfo'

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
  age: string
  containers: JSX.Element
  restarts: string
  action: JSX.Element
}
