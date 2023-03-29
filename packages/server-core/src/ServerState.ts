import * as k8s from '@kubernetes/client-node'

import { defineState } from '@etherealengine/hyperflux'

export const ServerMode = {
  API: 'API' as const,
  Instance: 'Instance' as const,
  Task: 'Task' as const
}

export type ServerTypeMode = typeof ServerMode[keyof typeof ServerMode]

export const ServerState = defineState({
  name: 'ServerState',
  initial: {
    k8AgonesClient: null! as k8s.CustomObjectsApi,
    k8DefaultClient: null! as k8s.CoreV1Api,
    k8AppsClient: null! as k8s.AppsV1Api,
    k8BatchClient: null! as k8s.BatchV1Api,
    agonesSDK: null! as Record<any, any>,
    serverMode: null! as ServerTypeMode
  }
})
