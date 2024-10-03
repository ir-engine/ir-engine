/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/ir-engine/ir-engine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Infinite Reality Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Infinite Reality Engine team.

All portions of the code written by the Infinite Reality Engine team are Copyright © 2021-2023 
Infinite Reality Engine. All Rights Reserved.
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

import { defineComponent, useComponent, useEntityContext } from '@ir-engine/ecs'
import { NO_PROXY, useDidMount } from '@ir-engine/hyperflux'
import { useHelperEntity } from '@ir-engine/spatial/src/common/debug/DebugComponentUtils'
import { useDisposable, useResource } from '@ir-engine/spatial/src/resources/resourceHooks'

import { S } from '@ir-engine/ecs/src/schemas/JSONSchemas'
import { degreesToRadians } from '@ir-engine/visual-script'
import { AudioNodeGroup } from '../../scene/components/MediaComponent'

export const PositionalAudioHelperComponent = defineComponent({
  name: 'PositionalAudioHelperComponent',

  schema: S.Object({
    name: S.String('positional-audio-helper'),
    audio: S.Type<AudioNodeGroup>(),
    range: S.Number(1),
    divisionsInnerAngle: S.Number(16),
    divisionsOuterAngle: S.Number(2),
    innerAngle: S.Number(0),
    outerAngle: S.Number(0),
    divisions: S.Number(0),
    entity: S.Entity()
  }),

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

        // Iterate exactly 'divisions' times to ensure proper segments
        for (let j = 0; j < divisions; j++) {
          const i = from + j * step
          const stride = start + count

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

      function generateSphericalSector(angle, materialIndex, radialDivisions = 36, verticalDivisions = 18) {
        const angleInRadians = degreesToRadians(angle) // Convert angle to radians
        const stepAngle = angleInRadians / radialDivisions // Angle step based on the given cone angle
        const verticalStep = Math.PI / verticalDivisions // Step size along the vertical angle (latitude)

        let count = 0

        // Loop through vertical divisions (latitude)
        for (let v = 0; v < verticalDivisions; v++) {
          const theta1 = v * verticalStep // Current latitude
          const theta2 = (v + 1) * verticalStep // Next latitude

          // Radius at the current and next latitude
          const r1 = range * Math.sin(theta1)
          const r2 = range * Math.sin(theta2)

          // z positions at current and next latitude
          const z1 = range * Math.cos(theta1)
          const z2 = range * Math.cos(theta2)

          // Loop through radial divisions (longitude)
          for (let h = 0; h <= radialDivisions; h++) {
            const phi1 = h * stepAngle - angleInRadians / 2 // Current angle offset by half the angle to center the cone

            const phi2 = (h + 1) * stepAngle - angleInRadians / 2 // Next angle

            // Vertices on the first circle (current latitude)
            const x1 = r1 * Math.cos(phi1)
            const y1 = r1 * Math.sin(phi1)

            // Vertices on the second circle (next latitude)
            const x2 = r2 * Math.cos(phi1)
            const y2 = r2 * Math.sin(phi1)

            // Next longitude vertices on the first circle
            const x1Next = r1 * Math.cos(phi2)
            const y1Next = r1 * Math.sin(phi2)

            // Next longitude vertices on the second circle
            const x2Next = r2 * Math.cos(phi2)
            const y2Next = r2 * Math.sin(phi2)

            // Draw vertical lines between consecutive latitudes
            positionAttribute.setXYZ(start + count, x1, y1, z1)
            positionAttribute.setXYZ(start + count + 1, x2, y2, z2)
            count += 2

            // Draw horizontal lines around the current latitude
            if (h < radialDivisions) {
              // Current latitude circle
              positionAttribute.setXYZ(start + count, x1, y1, z1)
              positionAttribute.setXYZ(start + count + 1, x1Next, y1Next, z1)
              count += 2

              // Next latitude circle
              positionAttribute.setXYZ(start + count, x2, y2, z2)
              positionAttribute.setXYZ(start + count + 1, x2Next, y2Next, z2)
              count += 2
            }

            // If angle < 360, draw lines from boundary to sphere center
            if (h === 0 || h === radialDivisions) {
              // Line from boundary vertex on current latitude to center (origin)
              positionAttribute.setXYZ(start + count, 0, 0, 0)
              positionAttribute.setXYZ(start + count + 1, x1, y1, z1)
              count += 2

              // Line from boundary vertex on next latitude to center (origin)
              positionAttribute.setXYZ(start + count, 0, 0, 0)
              positionAttribute.setXYZ(start + count + 1, x2, y2, z2)
              count += 2
            }
          }
        }

        geometry.addGroup(start, count, materialIndex)
        start += count
      }

      // generateSegment(-halfConeOuterAngle, -halfConeInnerAngle, divisionsOuterAngle, 0)
      // generateSegment(-halfConeInnerAngle, halfConeInnerAngle, divisionsInnerAngle, 1)
      // generateSegment(halfConeInnerAngle, halfConeOuterAngle, divisionsOuterAngle, 0)

      generateSphericalSector(coneInnerAngle, 1)

      positionAttribute.needsUpdate = true

      if (coneInnerAngle === coneOuterAngle) (materials[0] as Material).visible = false
    }, [
      component.audio,
      component.range,
      component.divisionsInnerAngle,
      component.divisionsOuterAngle,
      component.innerAngle,
      component.outerAngle,
      component.divisions
    ])

    return null
  }
})
