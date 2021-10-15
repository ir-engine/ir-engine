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

export const AdminAction = {
  videoCreated: (data: VideoCreatedResponse) => {
    return {
      type: 'VIDEO_CREATED' as const,
      data: data
    }
  },
  videoUpdated: (data: VideoUpdatedResponse) => {
    return {
      type: 'VIDEO_UPDATED' as const,
      data: data
    }
  },
  videoDeleted: (data: VideoDeletedResponse) => {
    return {
      type: 'VIDEO_DELETED' as const,
      data: data
    }
  }
}

export type AdminActionType = ReturnType<typeof AdminAction[keyof typeof AdminAction]>
