import { StaticResource } from '@xrengine/common/src/interfaces/StaticResource'
import { VIDEO_CREATED, VIDEO_DELETED, VIDEO_UPDATED } from '../actions'

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
