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
  ConeGeometry,
  Group,
  InterleavedBufferAttribute,
  LatheGeometry,
  Material,
  MathUtils,
  Mesh,
  MeshBasicMaterial,
  Vector2
} from 'three'

import { defineComponent, Entity, getMutableComponent, useComponent, useEntityContext } from '@ir-engine/ecs'
import { NO_PROXY, useDidMount } from '@ir-engine/hyperflux'
import { useHelperEntity } from '@ir-engine/spatial/src/common/debug/DebugComponentUtils'
import { useResource } from '@ir-engine/spatial/src/resources/resourceHooks'

import { S } from '@ir-engine/ecs/src/schemas/JSONSchemas'
import { addObjectToGroup, GroupComponent } from '@ir-engine/spatial/src/renderer/components/GroupComponent'
import { AudioNodeGroup } from '../../scene/components/MediaComponent'
import { mergeGeometries } from '../../scene/util/meshUtils'

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
      // const positions = new Float32Array((component.divisions.value * 3 + 3) * 3)
      // geometry.setAttribute('position', new BufferAttribute(positions, 3))
      return geometry
    }

    const [geometryState] = useResource<BufferGeometry>(createGeometry, entity)
    const [materialInnerAngle] = useResource(() => new MeshBasicMaterial({ color: 0x00ff00, wireframe: true }), entity)
    const [materialOuterAngle] = useResource(() => new MeshBasicMaterial({ color: 0xffff00, wireframe: true }), entity)
    // const [line] = useDisposable(
    //   Line<BufferGeometry, LineBasicMaterial[]>,
    //   entity,
    //   geometryState.value as BufferGeometry,
    //   [materialOuterAngle.value as MeshBasicMaterial, materialInnerAngle.value as MeshBasicMaterial]
    // )
    useHelperEntity(entity, component) //, line)

    useDidMount(() => {
      component.divisions.set(component.divisionsInnerAngle.value + component.divisionsOuterAngle.value * 2)
    }, [component.divisionsInnerAngle, component.divisionsOuterAngle])

    useDidMount(() => {
      geometryState.set(createGeometry())
      // line.geometry = geometryState.get(NO_PROXY) as BufferGeometry
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

      function generateSphericalSector(angle, materialIndex) {
        cleanGroup(entity)

        const sgmnts = Math.floor(audio.panner!.coneInnerAngle / 30)
        const capSegments = Math.max(sgmnts, 3)
        const coneSegments = capSegments * 4

        const coneHyp = range
        const coneOpp = coneHyp * Math.sin(angle / 2)
        const coneHeight = Math.sqrt(coneHyp ** 2 - coneOpp ** 2)

        const coneGeometry = new ConeGeometry(coneOpp, coneHeight, coneSegments, 1, true)

        if (angle <= Math.PI) coneGeometry.rotateX(Math.PI)

        coneGeometry.translate(0, (angle <= Math.PI ? 1 : -1) * (coneHeight / 2), 0)

        const capPoints = [] as Vector2[]
        for (let i = 0; i <= capSegments; i++) {
          const x = Math.sin(((i / capSegments) * angle) / 2) * -coneHyp
          const y = Math.cos(((i / capSegments) * angle) / 2) * -coneHyp
          capPoints.push(new Vector2(x, y))
        }

        const capGeometry = new LatheGeometry(capPoints, coneSegments)
        capGeometry.rotateX(Math.PI)
        // capGeometry.translate(0, coneHeight, 0)

        const mergedGeo = mergeGeometries([capGeometry, coneGeometry])
        mergedGeo?.rotateX(Math.PI / 2)
        geometryState.set(mergedGeo!)

        const mergedMesh = new Mesh(mergedGeo!, materials[materialIndex] as Material)
        addObjectToGroup(entity, mergedMesh)
      }

      // generateSegment(-halfConeOuterAngle, -halfConeInnerAngle, divisionsOuterAngle, 0)
      // generateSegment(-halfConeInnerAngle, halfConeInnerAngle, divisionsInnerAngle, 1)
      // generateSegment(halfConeInnerAngle, halfConeOuterAngle, divisionsOuterAngle, 0)

      generateSphericalSector(coneInnerAngle, 1)

      // positionAttribute.needsUpdate = true

      if (coneInnerAngle === coneOuterAngle) (materials[0] as Material).visible = false

      return () => {
        cleanGroup(entity)
      }
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

function cleanGroup(entity: Entity) {
  const grp = getMutableComponent(entity, GroupComponent)
  grp.forEach((groupChild) => {
    if (groupChild instanceof Group) {
      groupChild.children.value.forEach((nestedChild) => {
        if (nestedChild instanceof Mesh) {
          nestedChild.geometry.dispose()
          nestedChild.material.dispose()
        }
      })
    }
  })
}
