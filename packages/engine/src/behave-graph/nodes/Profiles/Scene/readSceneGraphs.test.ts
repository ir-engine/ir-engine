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

import * as flashSuzanneJson from '../../../../../apps/three-viewer/public/graphs/scene/actions/FlashSuzanne.json'
import * as hierarchyJson from '../../../../../apps/three-viewer/public/graphs/scene/actions/Hierarchy.json'
import * as spinningSuzanneJson from '../../../../../apps/three-viewer/public/graphs/scene/actions/SpinningSuzanne.json'
import * as colorJson from '../../../../../graphs/scene/logic/Color.json'
import * as eulerJson from '../../../../../graphs/scene/logic/Euler.json'
import * as quaternionJson from '../../../../../graphs/scene/logic/Quaternion.json'
import * as vector2Json from '../../../../../graphs/scene/logic/Vector2.json'
import * as vector3Json from '../../../../../graphs/scene/logic/Vector3.json'
import * as vector4Json from '../../../../../graphs/scene/logic/Vector4.json'
import { Logger } from '../../Diagnostics/Logger.js'
import { GraphInstance } from '../../Graphs/Graph.js'
import { GraphJSON } from '../../Graphs/IO/GraphJSON.js'
import { readGraphFromJSON } from '../../Graphs/IO/readGraphFromJSON.js'
import { validateGraphAcyclic } from '../../Graphs/Validation/validateGraphAcyclic.js'
import { validateGraphLinks } from '../../Graphs/Validation/validateGraphLinks.js'
import { Registry } from '../../Registry.js'
import { registerCoreProfile } from '../Core/registerCoreProfile.js'
import { registerSceneProfile } from './registerSceneProfile.js'

const registry = new Registry()
registerCoreProfile(registry)
registerSceneProfile(registry)

Logger.onWarn.clear()

const exampleMap: { [key: string]: any } = {
  vector2Json,
  vector3Json,
  vector4Json,
  quaternionJson,
  colorJson,
  eulerJson,
  flashSuzanneJson,
  hierarchyJson,
  spinningSuzanneJson
}

for (const key in exampleMap) {
  describe(`${key}`, () => {
    const exampleJson = exampleMap[key] as GraphJSON

    let parsedGraphJson: GraphInstance | undefined
    test('parse json to graph', () => {
      expect(() => {
        parsedGraphJson = readGraphFromJSON({
          graphJson: exampleJson,
          registry
        })
      }).not.toThrow()
      // await fs.writeFile('./examples/test.json', JSON.stringify(writeGraphToJSON(graph), null, ' '), { encoding: 'utf-8' });
      if (parsedGraphJson !== undefined) {
        expect(validateGraphLinks(parsedGraphJson.nodes)).toHaveLength(0)
        expect(validateGraphAcyclic(parsedGraphJson.nodes)).toHaveLength(0)
      } else {
        expect(parsedGraphJson).toBeDefined()
      }
    })
  })
}
