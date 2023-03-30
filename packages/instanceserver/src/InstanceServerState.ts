import { Instance } from '@etherealengine/common/src/interfaces/Instance'
import { defineState } from '@etherealengine/hyperflux'

type AgonesGameServer = {
  status: {
    address: string // IP
  }
  objectMeta: {
    name: string
  }
}

export const InstanceServerState = defineState({
  name: 'InstanceServerState',
  initial: {
    instance: null! as Instance, // todo: make type 'Instance'
    isSubdomainNumber: null as string | null,
    isMediaInstance: false,
    instanceServer: null! as AgonesGameServer
  }
})
