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

import * as customEventJson from '../../../../../graphs/core/events/CustomEvents.json'
import * as lifecycleJson from '../../../../../graphs/core/events/Lifecycle.json'
import * as branchJson from '../../../../../graphs/core/flow/Branch.json'
import * as flipFlopJson from '../../../../../graphs/core/flow/FlipFlop.json'
import * as forLoopJson from '../../../../../graphs/core/flow/ForLoop.json'
import * as performanceTestJson from '../../../../../graphs/core/flow/PerformanceTest.json'
import * as sequenceJson from '../../../../../graphs/core/flow/Sequence.json'
import * as helloWorldJson from '../../../../../graphs/core/HelloWorld.json'
import * as polynomialJson from '../../../../../graphs/core/logic/Polynomial.json'
import * as delayJson from '../../../../../graphs/core/time/Delay.json'
import * as frameCounterJson from '../../../../../graphs/core/variables/FrameCounter.json'
import * as initialValueJson from '../../../../../graphs/core/variables/InitialValue.json'
import * as setGetJson from '../../../../../graphs/core/variables/SetGet.json'
import { Logger } from '../../Diagnostics/Logger.js'
import { GraphInstance } from '../../Graphs/Graph.js'
import { GraphJSON } from '../../Graphs/IO/GraphJSON.js'
import { readGraphFromJSON } from '../../Graphs/IO/readGraphFromJSON.js'
import { validateGraphAcyclic } from '../../Graphs/Validation/validateGraphAcyclic.js'
import { validateGraphLinks } from '../../Graphs/Validation/validateGraphLinks.js'
import { getCoreNodeDefinitions, getCoreValueMap } from './registerCoreProfile.js'

const valueTypes = getCoreValueMap()
const nodeDefinitions = getCoreNodeDefinitions(valueTypes)

Logger.onWarn.clear()

const exampleMap: { [key: string]: any } = {
  branchJson,
  delayJson,
  flipFlopJson,
  forLoopJson,
  sequenceJson,
  helloWorldJson,
  setGetJson,
  polynomialJson,
  customEventJson,
  lifecycleJson,
  frameCounterJson,
  initialValueJson,
  performanceTestJson
}

for (const key in exampleMap) {
  describe(`${key}`, () => {
    const exampleJson = exampleMap[key] as GraphJSON

    let parsedGraphJson: GraphInstance | undefined
    test('parse json to graph', () => {
      expect(() => {
        parsedGraphJson = readGraphFromJSON({
          graphJson: exampleJson,
          nodes: nodeDefinitions,
          values: valueTypes,
          dependencies: {}
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
