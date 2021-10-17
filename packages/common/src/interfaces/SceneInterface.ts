export interface SceneInterface {
  id: string
  user_id: string
  isPublic: boolean
  metadata: string
  name: string
  root: string
  sidsid: string
  type: string
  url: string
  version: string
}

// TODO
export interface SceneDetailData {
  // [x: string]: any
  sceneId: string
  project_id: string
  url: string
  model_url: string
  screenshot_url: string
}

export interface SceneDetailInterface {
  name: string
  parent_scene: SceneDetailData
  project_id: string
  project_url: string
  scene: SceneDetailData
  thumbnailUrl: string
  ownedFileIds: string
}
