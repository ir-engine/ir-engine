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
import { Color, DoubleSide, Mesh, MeshBasicMaterial, SphereGeometry } from 'three'

import { getComponent, removeComponent, setComponent } from '@etherealengine/ecs/src/ComponentFunctions'
import { ECSState } from '@etherealengine/ecs/src/ECSState'
import { Engine } from '@etherealengine/ecs/src/Engine'
import { Entity } from '@etherealengine/ecs/src/Entity'
import { createEntity, entityExists, removeEntity } from '@etherealengine/ecs/src/EntityFunctions'
import { defineSystem } from '@etherealengine/ecs/src/SystemFunctions'
import { defineActionQueue, defineState, getMutableState, getState, useMutableState } from '@etherealengine/hyperflux'

import React from 'react'
import { EngineState } from '../../EngineState'
import { NameComponent } from '../../common/NameComponent'
import { createTransitionState } from '../../common/functions/createTransitionState'
import { addObjectToGroup } from '../../renderer/components/GroupComponent'
import { setObjectLayers } from '../../renderer/components/ObjectLayerComponent'
import { setVisibleComponent } from '../../renderer/components/VisibleComponent'
import { ObjectLayers } from '../../renderer/constants/ObjectLayers'
import { ComputedTransformComponent } from '../../transform/components/ComputedTransformComponent'
import { TransformComponent } from '../../transform/components/TransformComponent'
import { CameraActions } from '../CameraState'
import { CameraSystem } from './CameraSystem'

const fadeToBlackQueue = defineActionQueue(CameraActions.fadeToBlack.matches)

const CameraFadeBlackEffectSystemState = defineState({
  name: 'CameraFadeBlackEffectSystemState',
  initial: {} as {
    transition: ReturnType<typeof createTransitionState>
    mesh: Mesh<SphereGeometry, MeshBasicMaterial>
    entity: Entity
  }
})

const execute = () => {
  const { transition, mesh, entity } = getState(CameraFadeBlackEffectSystemState)
  if (!entity) return

  for (const action of fadeToBlackQueue()) {
    transition.setState(action.in ? 'IN' : 'OUT')
    if (action.in) {
      setComponent(entity, ComputedTransformComponent, {
        referenceEntities: [Engine.instance.cameraEntity],
        computeFunction: () => {
          getComponent(entity, TransformComponent).position.copy(
            getComponent(Engine.instance.cameraEntity, TransformComponent).position
          )
        }
      })
    } else removeComponent(entity, ComputedTransformComponent)

    mesh.material.color = new Color('black')
    mesh.material.map = null
    mesh.material.needsUpdate = true
  }

  const deltaSeconds = getState(ECSState).deltaSeconds
  transition.update(deltaSeconds, (alpha) => {
    mesh.material.opacity = alpha
    setVisibleComponent(entity, alpha > 0)
  })
}

const Reactor = () => {
  useEffect(() => {
    const geometry = new SphereGeometry(10)
    const material = new MeshBasicMaterial({
      transparent: true,
      side: DoubleSide,
      depthWrite: true,
      depthTest: false
    })

    const mesh = new Mesh(geometry, material)
    mesh.layers.set(ObjectLayers.Camera)
    mesh.scale.set(-1, 1, -1)
    mesh.name = 'Camera Fade Transition'
    const entity = createEntity()
    setComponent(entity, NameComponent, mesh.name)
    addObjectToGroup(entity, mesh)
    mesh.renderOrder = 1
    setObjectLayers(mesh, ObjectLayers.Camera)
    const transition = createTransitionState(0.25, 'OUT')

    getMutableState(CameraFadeBlackEffectSystemState).set({
      transition,
      mesh,
      entity
    })

    return () => {
      if (entityExists(entity)) removeEntity(entity)
      getMutableState(CameraFadeBlackEffectSystemState).set({} as any)
    }
  }, [])

  return null
}

export const CameraFadeBlackEffectSystem = defineSystem({
  uuid: 'ee.engine.CameraFadeBlackEffectSystem',
  insert: { with: CameraSystem },
  execute,
  reactor: () => {
    if (!useMutableState(EngineState).viewerEntity.value) return null
    return <Reactor />
  }
})
