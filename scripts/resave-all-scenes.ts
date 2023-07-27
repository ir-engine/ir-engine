/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/EtherealEngine/etherealengine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Ethereal Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Ethereal Engine team.

All portions of the code written by the Ethereal Engine team are Copyright © 2021-2023 
Ethereal Engine. All Rights Reserved.
*/

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
import { PhysicsState } from '@etherealengine/engine/src/physics/state/PhysicsState'
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
import { loadEngineInjection } from '@etherealengine/projects/loadEngineInjection'

require('fix-esm').register()

/**
 * USAGE: `npx ts-node --swc scripts/resave-all-scenes.ts --write`
 */

// @TODO - this does not support most of our projects, so should not be used for production

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
    getMutableState(PhysicsState).physicsWorld.set(Physics.createWorld())
    await loadEngineInjection(projects)

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

    const newScene = serializeWorld(UUIDComponent.entitiesByUUID[sceneJson.root]) as SceneJson

    // log each component diff
    const changes = JSON.parse(JSON.stringify(diff(sceneJson, newScene))) as SceneJson
    console.log('changes to', scene)
    if (changes.entities)
      for (const entity of Object.values(changes.entities)) {
        console.log(...Object.values(entity.components).map((val) => JSON.stringify(val, null, 2)))
      }

    // save file
    if (options.write) fs.writeFileSync(scene, JSON.stringify(newScene, null, 2))
  }

  cli.ok('Done')
}

Physics.load().then(() => {
  resaveAllProjects()
})
