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

import { defineQuery, defineSystem, getComponent, PresentationSystemGroup, setComponent } from '@etherealengine/ecs'

import { AudioAnalysisComponent } from '../../scene/components/AudioAnalysisComponent'

const audioAnalysisQuery = defineQuery([AudioAnalysisComponent])

type VizRange = { start: number; end: number }
type VizMult = (comp) => number
const vizRanges: Map<VizRange, VizMult> = new Map([
  [{ start: 0 / 3, end: 1 / 3 }, (comp) => comp.bassMultiplier * (comp.bassEnabled ? 1 : 0)],
  [{ start: 1 / 3, end: 2 / 3 }, (comp) => comp.midMultiplier * (comp.midEnabled ? 1 : 0)],
  [{ start: 2 / 3, end: 3 / 3 }, (comp) => comp.trebleMultiplier * (comp.trebleEnabled ? 1 : 0)]
])

export const AudioAnalysisSystem = defineSystem({
  uuid: 'ee.engine.AudioAnalysisSystem',
  insert: { after: PresentationSystemGroup },
  execute: () => {
    for (const entity of audioAnalysisQuery()) {
      const analysisComponent = getComponent(entity, AudioAnalysisComponent)
      const session = analysisComponent.session
      if (session == null) {
        continue
      }
      const { analyser, frequencyData } = session
      const bufferLength = analyser.frequencyBinCount
      analyser.getByteFrequencyData(frequencyData)

      for (const [range, mult] of vizRanges) {
        const start = Math.floor(range.start * bufferLength)
        const end = Math.floor(range.end * bufferLength)
        const multiplier = mult(analysisComponent)
        for (let i = start; i < end; i++) {
          frequencyData[i] *= multiplier
        }
      }

      setComponent(entity, AudioAnalysisComponent, { session })
    }
  }
})
