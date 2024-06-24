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

import React, { useEffect } from 'react'
import { BufferAttribute, BufferGeometry, LineBasicMaterial, LineSegments } from 'three'

import { Engine, Entity, EntityUUID, QueryReactor, UUIDComponent } from '@etherealengine/ecs'
import { getComponent, setComponent, useComponent } from '@etherealengine/ecs/src/ComponentFunctions'
import { createEntity, removeEntity, useEntityContext } from '@etherealengine/ecs/src/EntityFunctions'
import { defineSystem } from '@etherealengine/ecs/src/SystemFunctions'
import { getMutableState, getState, useMutableState } from '@etherealengine/hyperflux'

import { NameComponent } from '../common/NameComponent'
import { RapierWorldState } from '../physics/classes/Physics'
import { addObjectToGroup, GroupComponent } from '../renderer/components/GroupComponent'
import { setObjectLayers } from '../renderer/components/ObjectLayerComponent'
import { setVisibleComponent } from '../renderer/components/VisibleComponent'
import { ObjectLayers } from '../renderer/constants/ObjectLayers'
import { RendererState } from '../renderer/RendererState'
import { WebGLRendererSystem } from '../renderer/WebGLRendererSystem'
import { EntityTreeComponent } from '../transform/components/EntityTree'
import { createInfiniteGridHelper } from './components/InfiniteGridHelper'
import { SceneComponent } from './components/SceneComponents'

const PhysicsDebugEntities = new Map<EntityUUID, Entity>()

const execute = () => {
  for (const [id, physicsDebugEntity] of Array.from(PhysicsDebugEntities)) {
    const world = getState(RapierWorldState)[id]
    if (!world) continue
    const lineSegments = getComponent(physicsDebugEntity, GroupComponent)[0] as any as LineSegments
    const debugRenderBuffer = world.debugRender()
    lineSegments.geometry.setAttribute('position', new BufferAttribute(debugRenderBuffer.vertices, 3))
    lineSegments.geometry.setAttribute('color', new BufferAttribute(debugRenderBuffer.colors, 4))
  }
}

const PhysicsReactor = () => {
  const entity = useEntityContext()
  const uuid = useComponent(entity, UUIDComponent).value
  const engineRendererSettings = useMutableState(RendererState)

  useEffect(() => {
    /** @todo move physics debug to physics module */
    if (!engineRendererSettings.physicsDebug.value) return

    const lineMaterial = new LineBasicMaterial({ vertexColors: true })
    const lineSegments = new LineSegments(new BufferGeometry(), lineMaterial)
    lineSegments.frustumCulled = false

    const lineSegmentsEntity = createEntity()
    setComponent(lineSegmentsEntity, NameComponent, 'Physics Debug')
    setVisibleComponent(lineSegmentsEntity, true)
    addObjectToGroup(lineSegmentsEntity, lineSegments)

    setComponent(lineSegmentsEntity, EntityTreeComponent, { parentEntity: entity })

    setObjectLayers(lineSegments, ObjectLayers.PhysicsHelper)
    PhysicsDebugEntities.set(uuid, lineSegmentsEntity)

    return () => {
      removeEntity(lineSegmentsEntity)
      PhysicsDebugEntities.delete(uuid)
    }
  }, [engineRendererSettings.physicsDebug, uuid])

  return null
}

const reactor = () => {
  const engineRendererSettings = useMutableState(RendererState)

  useEffect(() => {
    if (!engineRendererSettings.gridVisibility.value) return

    const infiniteGridHelperEntity = createInfiniteGridHelper()
    setComponent(infiniteGridHelperEntity, EntityTreeComponent, { parentEntity: Engine.instance.originEntity })
    getMutableState(RendererState).infiniteGridHelperEntity.set(infiniteGridHelperEntity)
    return () => {
      removeEntity(infiniteGridHelperEntity)
      getMutableState(RendererState).infiniteGridHelperEntity.set(null)
    }
  }, [engineRendererSettings.gridVisibility])

  return (
    <>
      <QueryReactor Components={[SceneComponent]} ChildEntityReactor={PhysicsReactor} />
    </>
  )
}

export const DebugRendererSystem = defineSystem({
  uuid: 'ee.engine.DebugRendererSystem',
  insert: { before: WebGLRendererSystem },
  execute,
  reactor
})
