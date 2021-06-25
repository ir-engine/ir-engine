import {
    INSTANCES_RETRIEVED,
    INSTANCE_REMOVED_ROW,
} from "../../actions";

export interface InstancesRetrievedResponse {
    type: string,
    instances: any[]
  }
export interface InstanceRemovedResponse {
    type: string;
    instance: any;
  }
export function instancesRetrievedAction(instances: any): InstancesRetrievedResponse {
    return {
      type: INSTANCES_RETRIEVED,
      instances: instances
    };
  }
  
  export function instanceRemovedAction(instance: any): InstanceRemovedResponse {
    return {
      type: INSTANCE_REMOVED_ROW,
      instance: instance
    };
  }
  
  export function instanceRemoved(instance: any): InstanceRemovedResponse {
    return {
      type: INSTANCE_REMOVED_ROW,
      instance: instance
    };
  }
