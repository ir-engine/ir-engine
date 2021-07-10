import { SceneDataComponent } from './SceneDataComponent'

export interface SceneDataEntity {
  collectionId: string
  entityId: string
  id: string
  index: number
  name: string
  parent: string
  components: Array<SceneDataComponent>
  createdAt: string
  updatedAt: string
}
