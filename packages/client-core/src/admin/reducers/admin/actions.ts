import { StaticResource } from '@xrengine/common/src/interfaces/StaticResource';
import { INSTANCE_REMOVED } from '../../../social/reducers/actions';
import {
  INSTANCES_RETRIEVED,
  INSTANCE_CREATE,
  INSTANCE_PATCHED,
  INSTANCE_REMOVED_ROW,
  LOCATION_TYPES_RETRIEVED,
  USER_ROLE_RETRIEVED,
  USER_ROLE_CREATED,
} from '../../../world/reducers/actions';
import {
  VIDEO_CREATED,
  VIDEO_DELETED,
  VIDEO_UPDATED,
  PARTY_ADMIN_CREATED,
  PARTY_ADMIN_DISPLAYED,
} from '../actions';

export interface VideoCreationForm {
  name: string;
  description: string;
  url: string;
  metadata: object;
}

export interface VideoUpdateForm {
  id: string;
  name: string;
  description: string;
  url: string;
  metadata: object;
}

export interface VideoCreatedResponse {
  id: string;
  name: string;
  url: string;
  description: string;
  metadata: object;
  userId: string;
  mimeType: string;
  staticResourceType: string;
}

export interface VideoUpdatedResponse {
  id: string;
  name: string;
  url: string;
  description: string;
  metadata: object;
  userId: string;
  mimeType: string;
  staticResourceType: string;
}

export interface VideoDeletedResponse {
  id: string;
  name: string;
  url: string;
  description: string;
  metadata: object;
  userId: string;
  mimeType: string;
  staticResourceType: string;
}

export interface InstancesRetrievedResponse {
  type: string,
  instances: any[]
}

export interface LocationTypesRetrievedResponse {
  type: string;
  types: any[];
}

export interface InstanceRemovedResponse {
  type: string;
  instance: any;
}

export interface VideoCreatedAction {
  type: string;
  data: StaticResource;
}
export interface VideoDeletedAction {
  type: string;
  data: StaticResource;
}

export interface VideoUpdatedAction {
  type: string;
  data: StaticResource;
}

export interface userRoleRetrievedResponse {
  type: string;
  types: any[];
}

export interface partyAdminCreatedResponse {
  type: string,
  data: any;
}

export function videoCreated (data: VideoCreatedResponse): VideoCreatedAction {
  return {
    type: VIDEO_CREATED,
    data: data
  };
}

export function videoUpdated (data: VideoUpdatedResponse): VideoUpdatedAction {
  return {
    type: VIDEO_UPDATED,
    data: data
  };
}

export function videoDeleted (data: VideoDeletedResponse): VideoDeletedAction {
  return {
    type: VIDEO_DELETED,
    data: data
  };
}

export function locationTypesRetrieved(data: any): LocationTypesRetrievedResponse {
  return {
    type: LOCATION_TYPES_RETRIEVED,
    types: data
  };
}

export function instancesRetrievedAction(instances: any): InstancesRetrievedResponse {
  return {
    type: INSTANCES_RETRIEVED,
    instances: instances
  };
}

export function instanceRemovedAction(instance: any): InstanceRemovedResponse {
  return {
    type: INSTANCE_REMOVED,
    instance: instance
  };
}

export function instanceCreated(instance: any): InstanceRemovedResponse {
  return{
    type: INSTANCE_CREATE,
    instance: instance
  };
}

export function instanceRemoved(instance: any): InstanceRemovedResponse {
  return {
    type: INSTANCE_REMOVED_ROW,
    instance: instance
  };
}

export function instancePatched(instance: any): InstanceRemovedResponse {
  return {
    type: INSTANCE_PATCHED,
    instance: instance
  };
}


export const userRoleRetrieved = (data: any): userRoleRetrievedResponse  => {
  return {
    type: USER_ROLE_RETRIEVED,
    types: data
  };
};

export const userRoleCreated = (data: any): userRoleRetrievedResponse => {
  return {
    type: USER_ROLE_CREATED,
    types: data
  }; 
};


export const partyAdminCreated = (data: any): partyAdminCreatedResponse => {
  return {
    type: PARTY_ADMIN_CREATED,
    data: data
  };
};

export const partyRetrievedAction = (data: any): partyAdminCreatedResponse => {
  return {
    type: PARTY_ADMIN_DISPLAYED,
    data: data
  };
};