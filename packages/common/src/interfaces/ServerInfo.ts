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
}

export interface ServerContainerInfo {
  name: string
  restarts: number
  status: string
  ready: boolean
  started: boolean
}
