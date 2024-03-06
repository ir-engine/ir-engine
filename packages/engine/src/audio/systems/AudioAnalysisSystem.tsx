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

import { PresentationSystemGroup, defineQuery, defineSystem, getComponent, setComponent } from '@etherealengine/ecs'
import { AudioAnalysisComponent } from '../../scene/components/AudioAnalysisComponent'

const audioAnalysisQuery = defineQuery([AudioAnalysisComponent])

export const AudioAnalysisSystem = defineSystem({
  uuid: 'ee.engine.AudioAnalysisSystem',
  insert: { after: PresentationSystemGroup },
  execute: () => {
    for (const entity of audioAnalysisQuery()) {
      const analysisComponent = getComponent(entity, AudioAnalysisComponent)
      const helper = analysisComponent.analyser

      if (helper) {
        const bufferLength = helper.frequencyBinCount
        const dataArray = new Uint8Array(bufferLength)
        helper.getByteFrequencyData(dataArray)
        const trebleRange = { start: 0, end: 342 }
        const midRange = { start: 342, end: 684 }
        const bassRange = { start: 684, end: bufferLength }

        for (let i = 0; i < dataArray.length; i++) {
          if (i >= bassRange.start && i < bassRange.end && analysisComponent.bassEnabled) {
            dataArray[i] *= analysisComponent.bassMultiplier
          } else if (i >= midRange.start && i < midRange.end && analysisComponent.midEnabled) {
            dataArray[i] *= analysisComponent.midMultiplier
          } else if (i >= trebleRange.start && i < trebleRange.end && analysisComponent.trebleEnabled) {
            dataArray[i] *= analysisComponent.trebleMultiplier
          } else {
            dataArray[i] = 0
          }
        }
        setComponent(entity, AudioAnalysisComponent, { dataArray })
      }
    }
  }
})
