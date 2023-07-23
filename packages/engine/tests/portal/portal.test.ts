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
import dotenv from 'dotenv-flow'

// import { SceneJson } from '@etherealengine/common/src/interfaces/SceneInterface'
// import { parseSceneDataCacheURLs } from '@etherealengine/server-core/src/projects/scene/scene-parser'

// import sceneJson from '../../../projects/default-project/default.scene.json'

dotenv.config({
  path: appRootPath.path,
  silent: true
})

// const sceneData = parseSceneDataCacheURLs(sceneJson as unknown as SceneJson, process.env.LOCAL_STORAGE_PROVIDER!)

// TODO replace with inidivudal unit tests for relevant functions
describe.skip('Portal', () => {
  // before(async () => {
  //   await initializeEngine(engineTestSetup)
  // })
  // it('Can load scene', async () => {
  //   //   await updateSceneFromJSON(sceneData)
  //   assert.equal(Engine.instance.entityQuery().length, 10)
  //   // TODO: test scene actor removal directly
  //   assert.equal(world.physics.bodies.size, 1)
  // })
  // it('Can unload scene', async () => {
  //   // unload
  //   await unloadScene()
  //   // test
  //   //   assert.equal(Engine.instance.entityQuery().length, 1) // world entity
  //   assert.equal(world.physics.bodies.size, 0)
  // })
  // it('Can load new scene', async () => {
  //   await updateSceneFromJSON(sceneData)
  //   //   assert.equal(Engine.instance.entityQuery().length, 10)
  //   assert.equal(world.physics.bodies.size, 1)
  // })
})
