export const InstanceAction = {
  instancesRetrievedAction: (instances: any) => {
    return {
      type: 'INSTANCES_RETRIEVED' as const,
      instances: instances
    }
  },
  instanceRemovedAction: (instance: any) => {
    return {
      type: 'INSTANCE_REMOVED_ROW' as const,
      instance: instance
    }
  }
}

export type InstanceActionType = ReturnType<typeof InstanceAction[keyof typeof InstanceAction]>
