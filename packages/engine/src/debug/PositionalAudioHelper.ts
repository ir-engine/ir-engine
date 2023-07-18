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

import { BufferAttribute, BufferGeometry, InterleavedBufferAttribute, Line, LineBasicMaterial, MathUtils } from 'three'

import { AudioNodeGroup } from '../scene/components/MediaComponent'

class PositionalAudioHelper extends Line {
  audio: AudioNodeGroup
  range: number
  divisionsInnerAngle: number
  divisionsOuterAngle: number
  type = 'PositionalAudioHelper'

  constructor(audio: AudioNodeGroup, range = 1, divisionsInnerAngle = 16, divisionsOuterAngle = 2) {
    const geometry = new BufferGeometry()
    const divisions = divisionsInnerAngle + divisionsOuterAngle * 2
    const positions = new Float32Array((divisions * 3 + 3) * 3)
    geometry.setAttribute('position', new BufferAttribute(positions, 3))

    const materialInnerAngle = new LineBasicMaterial({ color: 0x00ff00 })
    const materialOuterAngle = new LineBasicMaterial({ color: 0xffff00 })

    super(geometry, [materialOuterAngle, materialInnerAngle])

    this.audio = audio
    this.range = range
    this.divisionsInnerAngle = divisionsInnerAngle
    this.divisionsOuterAngle = divisionsOuterAngle
    this.userData = {}

    this.update()
  }

  update() {
    const audio = this.audio
    const range = this.range
    const divisionsInnerAngle = this.divisionsInnerAngle
    const divisionsOuterAngle = this.divisionsOuterAngle

    if (!audio.panner) return

    const coneInnerAngle = MathUtils.degToRad(audio.panner.coneInnerAngle)
    const coneOuterAngle = MathUtils.degToRad(audio.panner.coneOuterAngle)

    const halfConeInnerAngle = coneInnerAngle / 2
    const halfConeOuterAngle = coneOuterAngle / 2

    let start = 0
    let count = 0
    let i
    let stride

    const geometry = this.geometry
    const positionAttribute = geometry.attributes.position as BufferAttribute | InterleavedBufferAttribute

    geometry.clearGroups()

    //

    function generateSegment(from, to, divisions, materialIndex) {
      const step = (to - from) / divisions

      positionAttribute.setXYZ(start, 0, 0, 0)
      count++

      for (i = from; i < to; i += step) {
        stride = start + count

        positionAttribute.setXYZ(stride, Math.sin(i) * range, 0, Math.cos(i) * range)
        positionAttribute.setXYZ(
          stride + 1,
          Math.sin(Math.min(i + step, to)) * range,
          0,
          Math.cos(Math.min(i + step, to)) * range
        )
        positionAttribute.setXYZ(stride + 2, 0, 0, 0)

        count += 3
      }

      geometry.addGroup(start, count, materialIndex)

      start += count
      count = 0
    }

    //

    generateSegment(-halfConeOuterAngle, -halfConeInnerAngle, divisionsOuterAngle, 0)
    generateSegment(-halfConeInnerAngle, halfConeInnerAngle, divisionsInnerAngle, 1)
    generateSegment(halfConeInnerAngle, halfConeOuterAngle, divisionsOuterAngle, 0)

    //

    positionAttribute.needsUpdate = true

    if (coneInnerAngle === coneOuterAngle) this.material[0].visible = false
  }

  dispose() {
    this.geometry.dispose()
    this.material[0].dispose()
    this.material[1].dispose()
  }
}

export { PositionalAudioHelper }
