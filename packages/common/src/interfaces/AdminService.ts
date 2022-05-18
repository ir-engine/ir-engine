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
