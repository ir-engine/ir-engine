import { StaticResource } from '@xrengine/common/src/interfaces/StaticResource'
import { INSTANCE_REMOVED } from '../../../social/reducers/actions'
import {
  INSTANCES_RETRIEVED,
  INSTANCE_REMOVED_ROW,
  LOCATION_TYPES_RETRIEVED,
  USER_ROLE_RETRIEVED,
  USER_ROLE_CREATED,
  USER_ROLE_UPDATED
} from '../../../world/reducers/actions'

import {
  VIDEO_CREATED,
  VIDEO_DELETED,
  VIDEO_UPDATED,
  PARTY_ADMIN_CREATED,
  PARTY_ADMIN_DISPLAYED,
  USER_ADMIN_REMOVED,
  USER_ADMIN_CREATED,
  USER_ADMIN_PATCHED,
  USER_SEARCH_ADMIN,
  SINGLE_USER_ADMIN_LOADED
} from '../actions'

import { User } from '@xrengine/common/src/interfaces/User'

export interface VideoCreationForm {
  name: string
  description: string
  url: string
  metadata: object
}

export interface VideoUpdateForm {
  id: string
  name: string
  description: string
  url: string
  metadata: object
}

export interface VideoCreatedResponse {
  id: string
  name: string
  url: string
  description: string
  metadata: object
  userId: string
  mimeType: string
  staticResourceType: string
}

export interface VideoUpdatedResponse {
  id: string
  name: string
  url: string
  description: string
  metadata: object
  userId: string
  mimeType: string
  staticResourceType: string
}

export interface VideoDeletedResponse {
  id: string
  name: string
  url: string
  description: string
  metadata: object
  userId: string
  mimeType: string
  staticResourceType: string
}

export interface InstancesRetrievedResponse {
  type: string
  instances: any[]
}

export interface LocationTypesRetrievedResponse {
  type: string
  types: any[]
}

export interface InstanceRemovedResponse {
  type: string
  instance: any
}

export interface VideoCreatedAction {
  type: string
  data: StaticResource
}
export interface VideoDeletedAction {
  type: string
  data: StaticResource
}

export interface VideoUpdatedAction {
  type: string
  data: StaticResource
}

export interface userRoleRetrievedResponse {
  type: string
  types: any[]
}

export interface partyAdminCreatedResponse {
  type: string
  data: any
}

export interface userAdminRemovedResponse {
  type: string
  data: any
}

export interface AdminUserCreatedAction {
  type: string
  user: User
}

export function userCreated(user: User): AdminUserCreatedAction {
  return {
    type: USER_ADMIN_CREATED,
    user: user
  }
}

export function adminUserPatched(user: User): AdminUserCreatedAction {
  return {
    type: USER_ADMIN_PATCHED,
    user: user
  }
}

export function videoCreated(data: VideoCreatedResponse): VideoCreatedAction {
  return {
    type: VIDEO_CREATED,
    data: data
  }
}

export function videoUpdated(data: VideoUpdatedResponse): VideoUpdatedAction {
  return {
    type: VIDEO_UPDATED,
    data: data
  }
}

export function videoDeleted(data: VideoDeletedResponse): VideoDeletedAction {
  return {
    type: VIDEO_DELETED,
    data: data
  }
}

export function locationTypesRetrieved(data: any): LocationTypesRetrievedResponse {
  return {
    type: LOCATION_TYPES_RETRIEVED,
    types: data
  }
}

export function instancesRetrievedAction(instances: any): InstancesRetrievedResponse {
  return {
    type: INSTANCES_RETRIEVED,
    instances: instances
  }
}

export function instanceRemovedAction(instance: any): InstanceRemovedResponse {
  return {
    type: INSTANCE_REMOVED,
    instance: instance
  }
}

export function instanceRemoved(instance: any): InstanceRemovedResponse {
  return {
    type: INSTANCE_REMOVED_ROW,
    instance: instance
  }
}

export const userRoleRetrieved = (data: any): userRoleRetrievedResponse => {
  return {
    type: USER_ROLE_RETRIEVED,
    types: data
  }
}

export const userRoleCreated = (data: any): userRoleRetrievedResponse => {
  return {
    type: USER_ROLE_CREATED,
    types: data
  }
}

export const partyAdminCreated = (data: any): partyAdminCreatedResponse => {
  return {
    type: PARTY_ADMIN_CREATED,
    data: data
  }
}

export const partyRetrievedAction = (data: any): partyAdminCreatedResponse => {
  return {
    type: PARTY_ADMIN_DISPLAYED,
    data: data
  }
}

export const userAdminRemoved = (data): userAdminRemovedResponse => {
  return {
    type: USER_ADMIN_REMOVED,
    data: data
  }
}

export const userRoleUpdated = (data: any): any => {
  return {
    type: USER_ROLE_UPDATED,
    data: data
  }
}

export const searchedUser = (data: any): any => {
  return {
    type: USER_SEARCH_ADMIN,
    data: data
  }
}

export const fetchedSIngleUser = (data: any): any => {
  return {
    type: SINGLE_USER_ADMIN_LOADED,
    data: data
  }
}
