import { SceneDataEntity } from '@xrengine/engine/src/scene/interfaces/SceneDataEntity'

export interface SceneData {
  id: string
  isPublic: boolean
  locationId: string
  name: string
  metadata: Record<string, any>
  description: string
  entities: Array<SceneDataEntity>
  root: string
  sid: string
  thumbnailOwnedFileId: string
  type: string // "project"
  url: string
  userId: string
  version: number
  createdAt: string
  updatedAt: string
}
