import appRootPath from 'app-root-path'
import fs from 'fs'
import path from 'path'
import { v4 } from 'uuid'

import { SceneJson } from '@xrengine/common/src/interfaces/SceneInterface'

for (const project of fs.readdirSync(path.resolve(appRootPath.path, 'packages/projects/projects/'))) {
  const files = fs.readdirSync(path.resolve(appRootPath.path, 'packages/projects/projects/', project))
  const scenes = files.filter((dirent) => dirent.endsWith('.scene.json'))
  for (const scene of scenes) {
    const uuidMapping = {} as { [uuid: string]: string }
    const sceneJson = JSON.parse(
      fs.readFileSync(path.resolve(appRootPath.path, 'packages/projects/projects/', project, scene)).toString()
    ) as SceneJson
    for (const uuid of Object.keys(sceneJson.entities)) {
      uuidMapping[uuid] = v4()
    }
    sceneJson.root = uuidMapping[Object.keys(sceneJson.entities)[0]]
    for (const uuid of Object.keys(sceneJson.entities)) {
      if (Object.keys(uuidMapping).includes(sceneJson.entities[uuid].parent!)) {
        sceneJson.entities[uuid].parent =
          uuidMapping[Object.keys(uuidMapping).find((u) => u === sceneJson.entities[uuid].parent!)!]
      }
      if (Object.keys(uuidMapping).includes(uuid)) {
        sceneJson.entities[uuidMapping[Object.keys(uuidMapping).find((u) => u === uuid)!]] = sceneJson.entities[uuid]
        delete sceneJson.entities[uuid]
      }
    }
    fs.writeFileSync(
      path.resolve(appRootPath.path, 'packages/projects/projects/', project, scene),
      JSON.stringify(sceneJson, null, 2)
    )
  }
}
