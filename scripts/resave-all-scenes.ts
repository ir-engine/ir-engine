import appRootPath from 'app-root-path'
import cli from 'cli'
import { diff } from 'deep-object-diff'
import fs from 'fs'
import path from 'path'

import { createDOM } from '@etherealengine/client-core/tests/createDOM'
import { SceneJson } from '@etherealengine/common/src/interfaces/SceneInterface'
import { delay } from '@etherealengine/engine/src/common/functions/delay'
import { destroyEngine, Engine } from '@etherealengine/engine/src/ecs/classes/Engine'
import { EngineState } from '@etherealengine/engine/src/ecs/classes/EngineState'
import { SceneState } from '@etherealengine/engine/src/ecs/classes/Scene'
import {
  ComponentJSONIDMap,
  ComponentMap,
  setComponent
} from '@etherealengine/engine/src/ecs/functions/ComponentFunctions'
import { EntityTreeComponent } from '@etherealengine/engine/src/ecs/functions/EntityTree'
import { createEngine } from '@etherealengine/engine/src/initializeEngine'
import { Physics } from '@etherealengine/engine/src/physics/classes/Physics'
import { FogSettingsComponent } from '@etherealengine/engine/src/scene/components/FogSettingsComponent'
import { MediaSettingsComponent } from '@etherealengine/engine/src/scene/components/MediaSettingsComponent'
import { PostProcessingComponent } from '@etherealengine/engine/src/scene/components/PostProcessingComponent'
import { RenderSettingsComponent } from '@etherealengine/engine/src/scene/components/RenderSettingsComponent'
import { UUIDComponent } from '@etherealengine/engine/src/scene/components/UUIDComponent'
import { serializeWorld } from '@etherealengine/engine/src/scene/functions/serializeWorld'
import {
  updateSceneEntitiesFromJSON,
  updateSceneEntity
} from '@etherealengine/engine/src/scene/systems/SceneLoadingSystem'
import { getMutableState, getState } from '@etherealengine/hyperflux'

require('fix-esm').register()

/**
 * USAGE: `npm run resave-all-scenes -- --write`
 */

createDOM()
// import client systems so we know we have all components registered
// behave graph breaks import somehow, so use require...
require('@etherealengine/client-core/src/world/startClientSystems')
console.log(ComponentJSONIDMap.keys())

cli.enable('status')

const options = cli.parse({
  write: [false, 'Write', 'boolean']
})

console.log(options)

// manually disable all component reactors - we dont need any logic to actually run
for (const component of ComponentMap.values()) component.reactor = undefined

const resaveAllProjects = async () => {
  // get list of project folders in /packages/projects/projects
  const projectsPath = path.join(appRootPath.path, 'packages', 'projects', 'projects')
  const projects = fs.readdirSync(projectsPath)

  // for each project, get a list of .scene.json files and flatten them into a single array
  const scenes = projects
    .map((project) => {
      const projectPath = path.join(projectsPath, project)
      const projectScenes = fs.readdirSync(projectPath).filter((file) => file.endsWith('.scene.json'))
      return projectScenes.map((scene) => path.join(projectPath, scene))
    })
    .flat()

  for (const scene of scenes) {
    if (Engine.instance) {
      await destroyEngine()
    }

    const sceneName = path.basename(scene, '.scene.json')
    const projectname = path.basename(path.dirname(scene))

    console.log('')
    cli.info(`Project: ${projectname}, Scene: ${sceneName}`)

    createEngine()
    Engine.instance.physicsWorld = Physics.createWorld()
    getMutableState(EngineState).isEditor.set(true)

    // read scene file
    const sceneJson = JSON.parse(fs.readFileSync(scene, { encoding: 'utf-8' })) as SceneJson
    getMutableState(SceneState).sceneData.set({
      scene: sceneJson,
      name: scene
    } as any)

    const sceneState = getState(SceneState)
    setComponent(sceneState.sceneEntity, EntityTreeComponent, { parentEntity: null!, uuid: sceneJson.root })
    updateSceneEntity(sceneJson.root, sceneJson.entities[sceneJson.root])
    updateSceneEntitiesFromJSON(sceneJson.root)

    if ((sceneJson as any).metadata) {
      for (const [key, val] of Object.entries((sceneJson as any).metadata) as any) {
        switch (key) {
          case 'renderSettings':
            setComponent(sceneState.sceneEntity, RenderSettingsComponent, val)
            break
          case 'postprocessing':
            setComponent(sceneState.sceneEntity, PostProcessingComponent, val)
            break
          case 'mediaSettings':
            setComponent(sceneState.sceneEntity, MediaSettingsComponent, val)
            break
          case 'fog':
            setComponent(sceneState.sceneEntity, FogSettingsComponent, val)
            break
        }
      }
    }

    await delay(1)

    const newScene = serializeWorld(UUIDComponent.entitiesByUUID.value[sceneJson.root]) as SceneJson

    // log each component diff
    const changes = JSON.parse(JSON.stringify(diff(sceneJson, newScene))) as SceneJson
    console.log('changes to', scene)

    for (const entity of Object.values(changes.entities)) {
      console.log(entity.components)
    }

    // save file
    if (options.write) fs.writeFileSync(scene, JSON.stringify(newScene, null, 2))
  }

  cli.ok('Done')
}

Physics.load().then(() => {
  resaveAllProjects()
})
