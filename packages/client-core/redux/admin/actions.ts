import {
  VIDEO_CREATED,
  VIDEO_UPDATED,
  VIDEO_DELETED,
  LOCATION_TYPES_RETRIEVED,
  INSTANCES_RETRIEVED,
  INSTANCE_REMOVED
} from '../actions';
import { StaticResource } from '@xr3ngine/common/interfaces/StaticResource';

export interface VideoCreationForm {
  name: string;
  description: string;
  url: string;
  creator: string;
  metadata: object;
}

export interface VideoUpdateForm {
  id: string;
  name: string;
  description: string;
  url: string;
  creator: string;
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
  attributionId: string;
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
  attributionId: string;
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
  attributionId: string;
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