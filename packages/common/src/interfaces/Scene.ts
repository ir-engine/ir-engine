export interface PublicScenesState {
  scenes: Scene[]
  currentScene: Scene
  error: string
}

export interface Scene {
  url: string
  name: string
  thumbnailUrl?: string
}

export interface ScenesFetchedAction {
  type: string
  scenes?: Scene[]
  scene?: Scene
  message?: string
}

export interface CollectionsFetchedAction {
  type: string
  collections: any[]
}
