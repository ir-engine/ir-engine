export interface ServerInfoInterface {
  id: string
  label: string
  pods: ServerPodInfo[]
}

export interface ServerPodInfo {
  name: string
  status: string
  age: string | Date
  containers: ServerContainerInfo[]
  type?: string
  locationSlug?: string
  instanceId?: string
  currentUsers?: number
}

export type ServerContainerStatus = 'Running' | 'Terminated' | 'Waiting' | 'Undefined'

export interface ServerContainerInfo {
  name: string
  restarts: number
  status: ServerContainerStatus
  ready: boolean
  started: boolean
}
