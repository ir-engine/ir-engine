import { INSTANCES_RETRIEVED, INSTANCE_REMOVED_ROW } from '@xrengine/client-core/src/world/reducers/actions'
// } from "../../actions";

// /var/www/html/workspace/tsdoc/xr3ngine/packages/client-core/src/world/reducers/actions.ts
export interface InstancesRetrievedResponse {
  type: string
  instances: any[]
}
export interface InstanceRemovedResponse {
  type: string
  instance: any
}
export function instancesRetrievedAction(instances: any): InstancesRetrievedResponse {
  return {
    type: INSTANCES_RETRIEVED,
    instances: instances
  }
}

export function instanceRemovedAction(instance: any): InstanceRemovedResponse {
  return {
    type: INSTANCE_REMOVED_ROW,
    instance: instance
  }
}

export function instanceRemoved(instance: any): InstanceRemovedResponse {
  return {
    type: INSTANCE_REMOVED_ROW,
    instance: instance
  }
}
