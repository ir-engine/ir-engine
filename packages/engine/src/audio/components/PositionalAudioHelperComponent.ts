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
  BufferGeometry,
  ConeGeometry,
  DoubleSide,
  LatheGeometry,
  Material,
  MathUtils,
  Mesh,
  MeshBasicMaterial,
  Object3D,
  Vector2
} from 'three'

import { defineComponent, useComponent, useEntityContext } from '@ir-engine/ecs'
import { useResource } from '@ir-engine/spatial/src/resources/resourceHooks'

import { S } from '@ir-engine/ecs/src/schemas/JSONSchemas'
import { addObjectToGroup, removeObjectFromGroup } from '@ir-engine/spatial/src/renderer/components/GroupComponent'
import { T } from '@ir-engine/spatial/src/schema/schemaFunctions'
import { PositionalAudioComponent } from './PositionalAudioComponent'

export const PositionalAudioHelperComponent = defineComponent({
  name: 'PositionalAudioHelperComponent',

  schema: S.Object({
    name: S.String('positional-audio-helper'),
    entity: T.Entity()
  }),

  reactor: function () {
    const entity = useEntityContext()
    const audioComponent = useComponent(entity, PositionalAudioComponent)

    const [materialInnerAngle] = useResource(
      () => new MeshBasicMaterial({ color: 0x00ff00, transparent: true, opacity: 0.4, side: DoubleSide }),
      entity
    )
    const [materialOuterAngle] = useResource(
      () => new MeshBasicMaterial({ color: 0x000080, wireframe: true, side: DoubleSide }),
      entity
    )

    const [innerCone] = useResource(() => {
      return createCone(
        audioComponent.coneInnerAngle.value,
        audioComponent.maxDistance.value,
        materialInnerAngle.value as Material
      )
    })

    const [innerCap] = useResource(() => {
      return createCap(
        audioComponent.coneInnerAngle.value,
        audioComponent.maxDistance.value,
        materialInnerAngle.value as Material
      )
    })

    const [outerCone] = useResource(() => {
      return createCone(
        audioComponent.coneOuterAngle.value,
        audioComponent.maxDistance.value,
        materialOuterAngle.value as Material
      )
    })

    const [outerCap] = useResource(() => {
      return createCap(
        audioComponent.coneOuterAngle.value,
        audioComponent.maxDistance.value,
        materialOuterAngle.value as Material
      )
    })

    function createCone(angleDegrees: number, coneHyp: number, material: Material) {
      const sgmnts = Math.floor(angleDegrees / 30)
      const capSegments = Math.max(sgmnts, 3)
      const coneSegments = capSegments * 4
      const angleRad = MathUtils.degToRad(angleDegrees)

      const coneOpp = coneHyp * Math.sin(angleRad / 2)
      const coneHeight = Math.sqrt(coneHyp ** 2 - coneOpp ** 2)

      const coneGeometry = new ConeGeometry(coneOpp, coneHeight, coneSegments, 1, true)

      if (angleRad <= Math.PI) coneGeometry.rotateX(Math.PI)

      coneGeometry.translate(0, (angleRad <= Math.PI ? 1 : -1) * (coneHeight / 2), 0)
      coneGeometry.rotateX(Math.PI / 2)
      return new Mesh(coneGeometry as BufferGeometry, material)
    }

    function createCap(angleDegrees: number, coneHyp: number, material: Material) {
      const sgmnts = Math.floor(angleDegrees / 30)
      const capSegments = Math.max(sgmnts, 3)
      const angleRad = MathUtils.degToRad(angleDegrees)
      const coneSegments = capSegments * 4

      const capPoints = [] as Vector2[]
      for (let i = 0; i <= capSegments; i++) {
        const x = Math.sin(((i / capSegments) * angleRad) / 2) * -coneHyp
        const y = Math.cos(((i / capSegments) * angleRad) / 2) * -coneHyp
        capPoints.push(new Vector2(x, y))
      }

      const capGeometry = new LatheGeometry(capPoints, coneSegments)
      capGeometry.rotateX(Math.PI)
      capGeometry.rotateX(Math.PI / 2)
      return new Mesh(capGeometry as BufferGeometry, material)
    }

    useEffect(() => {
      if (!audioComponent) return

      innerCone.set(
        createCone(
          audioComponent.coneInnerAngle.value,
          audioComponent.maxDistance.value,
          materialInnerAngle.value as Material
        )
      )
      innerCap.set(
        createCap(
          audioComponent.coneInnerAngle.value,
          audioComponent.maxDistance.value,
          materialInnerAngle.value as Material
        )
      )
      outerCone.set(
        createCone(
          audioComponent.coneOuterAngle.value,
          audioComponent.maxDistance.value,
          materialOuterAngle.value as Material
        )
      )
      outerCap.set(
        createCap(
          audioComponent.coneOuterAngle.value,
          audioComponent.maxDistance.value,
          materialOuterAngle.value as Material
        )
      )
    }, [audioComponent.maxDistance.value, audioComponent.coneInnerAngle, audioComponent.coneOuterAngle])

    useEffect(() => {
      if (!audioComponent) return

      addObjectToGroup(entity, innerCone.value! as unknown as Object3D)
      addObjectToGroup(entity, innerCap.value! as unknown as Object3D)
      addObjectToGroup(entity, outerCone.value! as unknown as Object3D)
      addObjectToGroup(entity, outerCap.value! as unknown as Object3D)
      return () => {
        removeObjectFromGroup(entity, innerCone.value! as unknown as Object3D)
        removeObjectFromGroup(entity, innerCap.value! as unknown as Object3D)
        removeObjectFromGroup(entity, outerCone.value! as unknown as Object3D)
        removeObjectFromGroup(entity, outerCap.value! as unknown as Object3D)
      }
    }, [innerCone, innerCap, outerCone, outerCap])

    return null
  }
})
