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

All portions of the code written by the Infinite Reality Engine team are Copyright © 2021-2025
Infinite Reality Engine. All Rights Reserved.
*/

import { useHookstate } from '@hookstate/core'
import {
  createEntity,
  EntityTreeComponent,
  getMutableComponent,
  removeEntity,
  setComponent,
  UndefinedEntity,
  useComponent,
  useOptionalComponent
} from '@ir-engine/ecs'
import { PositionalAudioComponent } from '@ir-engine/engine/src/audio/components/PositionalAudioComponent'
import { MediaElementComponent } from '@ir-engine/engine/src/scene/components/MediaComponent'
import { TransformComponent } from '@ir-engine/spatial'
import { MeshComponent } from '@ir-engine/spatial/src/renderer/components/MeshComponent'
import { VisibleComponent } from '@ir-engine/spatial/src/renderer/components/VisibleComponent'
import { useEffect } from 'react'
import {
  BufferGeometry,
  ConeGeometry,
  DoubleSide,
  LatheGeometry,
  MathUtils,
  Mesh,
  MeshBasicMaterial,
  Vector2
} from 'three'

function createCone(angleDegrees: number, coneHyp: number) {
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
  return coneGeometry
}

function createCap(angleDegrees: number, coneHyp: number) {
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
  return capGeometry as BufferGeometry
}

export const PositionalAudioHelperReactor: React.FC = (props: { parentEntity; iconEntity; selected; hovered }) => {
  const { parentEntity, iconEntity, selected, hovered } = props
  const mediaElement = useOptionalComponent(parentEntity, MediaElementComponent)
  const debugEnabled = selected || hovered
  const audioComponent = useComponent(parentEntity, PositionalAudioComponent)
  const helperEntities = useHookstate({
    innerConeEntity: UndefinedEntity,
    innerCapEntity: UndefinedEntity,
    outerConeEntity: UndefinedEntity,
    outerCapEntity: UndefinedEntity
  })

  useEffect(() => {
    if (!debugEnabled) return

    const innerConeEntity = createEntity()
    setComponent(innerConeEntity, VisibleComponent)
    setComponent(innerConeEntity, TransformComponent)
    setComponent(innerConeEntity, EntityTreeComponent, { parentEntity })
    setComponent(
      innerConeEntity,
      MeshComponent,
      new Mesh(
        createCone(audioComponent.coneInnerAngle.value, audioComponent.maxDistance.value),
        new MeshBasicMaterial({ color: 0x00ff00, transparent: true, opacity: 0.4, side: DoubleSide })
      )
    )

    const innerCapEntity = createEntity()
    setComponent(innerCapEntity, VisibleComponent)
    setComponent(innerCapEntity, TransformComponent)
    setComponent(innerCapEntity, EntityTreeComponent, { parentEntity })
    setComponent(
      innerCapEntity,
      MeshComponent,
      new Mesh(
        createCap(audioComponent.coneInnerAngle.value, audioComponent.maxDistance.value),
        new MeshBasicMaterial({ color: 0x00ff00, transparent: true, opacity: 0.4, side: DoubleSide })
      )
    )

    const outerConeEntity = createEntity()
    setComponent(outerConeEntity, VisibleComponent)
    setComponent(outerConeEntity, TransformComponent)
    setComponent(outerConeEntity, EntityTreeComponent, { parentEntity })
    setComponent(
      outerConeEntity,
      MeshComponent,
      new Mesh(
        createCone(audioComponent.coneOuterAngle.value, audioComponent.maxDistance.value),
        new MeshBasicMaterial({ color: 0x000080, wireframe: true, side: DoubleSide })
      )
    )

    const outerCapEntity = createEntity()
    setComponent(outerCapEntity, VisibleComponent)
    setComponent(outerCapEntity, TransformComponent)
    setComponent(outerCapEntity, EntityTreeComponent, { parentEntity })
    setComponent(
      outerCapEntity,
      MeshComponent,
      new Mesh(
        createCap(audioComponent.coneOuterAngle.value, audioComponent.maxDistance.value),
        new MeshBasicMaterial({ color: 0x000080, wireframe: true, side: DoubleSide })
      )
    )

    helperEntities.set({
      innerConeEntity,
      innerCapEntity,
      outerConeEntity,
      outerCapEntity
    })

    return () => {
      removeEntity(helperEntities.innerConeEntity.value)
      removeEntity(helperEntities.innerCapEntity.value)
      removeEntity(helperEntities.outerConeEntity.value)
      removeEntity(helperEntities.outerCapEntity.value)
    }
  }, [debugEnabled, mediaElement?.value.element])

  useEffect(() => {
    const innerConeMesh = getMutableComponent(helperEntities.innerConeEntity.value, MeshComponent)
    const innerCapMesh = getMutableComponent(helperEntities.innerCapEntity.value, MeshComponent)

    if (!innerConeMesh || !innerCapMesh) return
    innerConeMesh.geometry.set(createCone(audioComponent.coneInnerAngle.value, audioComponent.maxDistance.value))
    innerCapMesh.geometry.set(createCap(audioComponent.coneInnerAngle.value, audioComponent.maxDistance.value))
  }, [audioComponent.coneInnerAngle.value, audioComponent.maxDistance.value])

  useEffect(() => {
    const outerConeMesh = getMutableComponent(helperEntities.outerConeEntity.value, MeshComponent)
    const outerCapMesh = getMutableComponent(helperEntities.outerCapEntity.value, MeshComponent)

    if (!outerConeMesh || !outerCapMesh) return

    outerConeMesh.geometry.set(createCone(audioComponent.coneOuterAngle.value, audioComponent.maxDistance.value))
    outerCapMesh.geometry.set(createCap(audioComponent.coneOuterAngle.value, audioComponent.maxDistance.value))
  }, [audioComponent.coneOuterAngle.value, audioComponent.maxDistance.value])

  return null
}
