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

import { AnimationMixer, Mesh, Object3D } from 'three'

import { EntityUUID } from '@etherealengine/common/src/interfaces/EntityUUID'

import { AnimationComponent } from '../../avatar/components/AnimationComponent'
import { Entity } from '../../ecs/classes/Entity'
import {
  ComponentJSONIDMap,
  ComponentMap,
  getComponent,
  hasComponent,
  removeComponent,
  setComponent
} from '../../ecs/functions/ComponentFunctions'
import { createEntity } from '../../ecs/functions/EntityFunctions'
import { addEntityNodeChild } from '../../ecs/functions/EntityTree'
import { LocalTransformComponent, TransformComponent } from '../../transform/components/TransformComponent'
import { computeLocalTransformMatrix, computeTransformMatrix } from '../../transform/systems/TransformSystem'
import { GLTFLoadedComponent } from '../components/GLTFLoadedComponent'
import { GroupComponent, addObjectToGroup } from '../components/GroupComponent'
import { ModelComponent } from '../components/ModelComponent'
import { NameComponent } from '../components/NameComponent'
import { SceneObjectComponent } from '../components/SceneObjectComponent'
import { ObjectLayers } from '../constants/ObjectLayers'
import { deserializeComponent } from '../systems/SceneLoadingSystem'
import { enableObjectLayer } from './setObjectLayers'

export const parseECSData = (entity: Entity, data: [string, any][]): void => {
  const components: { [key: string]: any } = {}
  const prefabs: { [key: string]: any } = {}

  for (const [key, value] of data) {
    const parts = key.split('.')
    if (parts.length > 1) {
      if (parts[0] === 'xrengine') {
        const componentExists = ComponentMap.has(parts[1])
        const _toLoad = componentExists ? components : prefabs
        if (typeof _toLoad[parts[1]] === 'undefined') {
          _toLoad[parts[1]] = {}
        }
        if (parts.length > 2) {
          let val = value
          if (value === 'true') val = true
          if (value === 'false') val = false
          _toLoad[parts[1]][parts[2]] = val
        }
      }
    }
  }

  for (const [key, value] of Object.entries(components)) {
    const component = ComponentMap.get(key)
    if (typeof component === 'undefined') {
      console.warn(`Could not load component '${key}'`)
    } else {
      setComponent(entity, component, value)
      getComponent(entity, GLTFLoadedComponent).push(component)
    }
  }

  for (const [key, value] of Object.entries(prefabs)) {
    const component = Array.from(ComponentJSONIDMap.keys()).find((jsonID) => jsonID === key)
    if (typeof component === 'undefined') {
      console.warn(`Could not load component '${component}'`)
    } else {
      getComponent(entity, GLTFLoadedComponent).push(component)
      deserializeComponent(entity, {
        name: key,
        props: value
      })
    }
  }
}

export const createObjectEntityFromGLTF = (entity: Entity, obj3d: Object3D): void => {
  parseECSData(entity, Object.entries(obj3d.userData))
}

export const parseObjectComponentsFromGLTF = (entity: Entity, object3d?: Object3D): void => {
  const scene = object3d ?? getComponent(entity, ModelComponent).scene
  const meshesToProcess: Mesh[] = []

  if (!scene) return

  scene.traverse((mesh: Mesh) => {
    if ('xrengine.entity' in mesh.userData) {
      meshesToProcess.push(mesh)
    }
  })

  if (meshesToProcess.length === 0) {
    setComponent(entity, GLTFLoadedComponent)
    scene.traverse((obj) => createObjectEntityFromGLTF(entity, obj))
    return
  }

  for (const mesh of meshesToProcess) {
    const e = createEntity()

    addEntityNodeChild(e, entity, undefined, mesh.uuid as EntityUUID)

    if (hasComponent(entity, SceneObjectComponent)) setComponent(e, SceneObjectComponent)

    setComponent(e, NameComponent, mesh.userData['xrengine.entity'] ?? mesh.uuid)

    delete mesh.userData['xrengine.entity']
    delete mesh.userData.name

    // setTransformComponent(e, mesh.position, mesh.quaternion, mesh.scale)
    setComponent(e, LocalTransformComponent, {
      position: mesh.position,
      rotation: mesh.quaternion,
      scale: mesh.scale
    })
    computeLocalTransformMatrix(entity)
    computeTransformMatrix(entity)

    addObjectToGroup(e, mesh)
    setComponent(e, GLTFLoadedComponent, ['entity', GroupComponent.name, TransformComponent.name])
    createObjectEntityFromGLTF(e, mesh)

    mesh.visible = false
  }
}

export const parseGLTFModel = (entity: Entity) => {
  const model = getComponent(entity, ModelComponent)
  if (!model.scene) return
  const scene = model.scene
  scene.updateMatrixWorld(true)

  // always parse components first
  parseObjectComponentsFromGLTF(entity, scene)

  enableObjectLayer(scene, ObjectLayers.Scene, true)

  // if the model has animations, we may have custom logic to initiate it. editor animations are loaded from `loop-animation` below
  if (scene.animations?.length) {
    // We only have to update the mixer time for this animations on each frame
    if (getComponent(entity, AnimationComponent)) removeComponent(entity, AnimationComponent)
    setComponent(entity, AnimationComponent, {
      mixer: new AnimationMixer(scene),
      animations: scene.animations
    })
  }
}
