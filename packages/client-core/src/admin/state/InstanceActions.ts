import { Instance } from '@standardcreative/common/src/interfaces/Instance'
import { InstanceResult } from '@standardcreative/common/src/interfaces/InstanceResult'

export const InstanceAction = {
  instancesRetrievedAction: (instanceResult: InstanceResult) => {
    return {
      type: 'INSTANCES_RETRIEVED' as const,
      instanceResult: instanceResult
    }
  },
  instanceRemovedAction: (instance: Instance) => {
    return {
      type: 'INSTANCE_REMOVED_ROW' as const,
      instance: instance
    }
  }
}

export type InstanceActionType = ReturnType<typeof InstanceAction[keyof typeof InstanceAction]>
