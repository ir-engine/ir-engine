export interface SceneJson {
  entities: { [uuid: string]: any }
  root: string
  metadata: string
  version: number
}

// export interface SceneInterface extends SceneJson {
//   id: string
//   user_id: string
//   isPublic: boolean
//   name: string
//   sidsid: string
//   type: string
//   url: string
// }

// TODO
export interface SceneDetailData {
  // [x: string]: any
  sceneId: string
  scene_id: string
  url: string
  model_url: string
  screenshot_url: string
}

export interface SceneDetailInterface {
  name: string
  thumbnailUrl: string
  scene?: SceneJson
  // parent_scene: SceneDetailData
  // scene_id: string
  // scene_url: string
}

export interface SceneSaveInterface {
  name: string
  scene_id: string
  thumbnailOwnedFileId: {
    file_id: string
    file_token: string
  }
  scene_file_id: string
  scene_file_token: string
}
