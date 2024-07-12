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

import { useEffect } from 'react'
import {
  BufferAttribute,
  BufferGeometry,
  InterleavedBufferAttribute,
  Line,
  LineBasicMaterial,
  Material,
  MathUtils
} from 'three'

import { useDidMount } from '@etherealengine/common/src/utils/useDidMount'
import { defineComponent, Entity, useComponent, useEntityContext } from '@etherealengine/ecs'
import { NO_PROXY } from '@etherealengine/hyperflux'
import { useHelperEntity } from '@etherealengine/spatial/src/common/debug/DebugComponentUtils'
import { useDisposable, useResource } from '@etherealengine/spatial/src/resources/resourceHooks'

import { AudioNodeGroup } from '../../scene/components/MediaComponent'

export const PositionalAudioHelperComponent = defineComponent({
  name: 'PositionalAudioHelperComponent',

  onInit: (entity) => {
    return {
      name: 'positional-audio-helper',
      audio: null! as AudioNodeGroup,
      range: 1,
      divisionsInnerAngle: 16,
      divisionsOuterAngle: 2,
      divisions: 0,
      entity: undefined as undefined | Entity
    }
  },

  onSet: (entity, component, json) => {
    if (!json) return

    if (!json.audio) throw new Error('PositionalAudioHelperComponent: Valid AudioNodeGroup required')
    component.audio.set(json.audio)
    if (typeof json.name === 'string') component.name.set(json.name)
    if (typeof json.range === 'number') component.range.set(json.range)
    if (typeof json.divisionsInnerAngle === 'number') component.divisionsInnerAngle.set(json.divisionsInnerAngle)
    if (typeof json.divisionsOuterAngle === 'number') component.divisionsOuterAngle.set(json.divisionsOuterAngle)
    component.divisions.set(component.divisionsInnerAngle.value + component.divisionsOuterAngle.value * 2)
  },

  reactor: function () {
    const entity = useEntityContext()
    const component = useComponent(entity, PositionalAudioHelperComponent)

    const createGeometry = () => {
      const geometry = new BufferGeometry()
      const positions = new Float32Array((component.divisions.value * 3 + 3) * 3)
      geometry.setAttribute('position', new BufferAttribute(positions, 3))
      return geometry
    }

    const [geometryState] = useResource<BufferGeometry>(createGeometry, entity)
    const [materialInnerAngle] = useResource(() => new LineBasicMaterial({ color: 0x00ff00 }), entity)
    const [materialOuterAngle] = useResource(() => new LineBasicMaterial({ color: 0xffff00 }), entity)
    const [line] = useDisposable(
      Line<BufferGeometry, LineBasicMaterial[]>,
      entity,
      geometryState.value as BufferGeometry,
      [materialOuterAngle.value as LineBasicMaterial, materialInnerAngle.value as LineBasicMaterial]
    )
    useHelperEntity(entity, component, line)

    useDidMount(() => {
      component.divisions.set(component.divisionsInnerAngle.value + component.divisionsOuterAngle.value * 2)
    }, [component.divisionsInnerAngle, component.divisionsOuterAngle])

    useDidMount(() => {
      geometryState.set(createGeometry())
      line.geometry = geometryState.get(NO_PROXY) as BufferGeometry
    }, [component.divisions])

    useEffect(() => {
      const audio = component.audio.value
      if (!audio.panner) return
      const range = component.range.value
      const divisionsInnerAngle = component.divisionsInnerAngle.value
      const divisionsOuterAngle = component.divisionsOuterAngle.value
      const geometry = geometryState.get(NO_PROXY)
      const materials = [materialOuterAngle.get(NO_PROXY), materialInnerAngle.get(NO_PROXY)]

      const coneInnerAngle = MathUtils.degToRad(audio.panner.coneInnerAngle)
      const coneOuterAngle = MathUtils.degToRad(audio.panner.coneOuterAngle)

      const halfConeInnerAngle = coneInnerAngle / 2
      const halfConeOuterAngle = coneOuterAngle / 2

      let start = 0
      let count = 0
      let i
      let stride

      const positionAttribute = geometry.attributes.position as BufferAttribute | InterleavedBufferAttribute

      geometry.clearGroups()

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

      generateSegment(-halfConeOuterAngle, -halfConeInnerAngle, divisionsOuterAngle, 0)
      generateSegment(-halfConeInnerAngle, halfConeInnerAngle, divisionsInnerAngle, 1)
      generateSegment(halfConeInnerAngle, halfConeOuterAngle, divisionsOuterAngle, 0)

      positionAttribute.needsUpdate = true

      if (coneInnerAngle === coneOuterAngle) (materials[0] as Material).visible = false
    }, [component.audio, component.range, component.divisions])

    return null
  }
})
