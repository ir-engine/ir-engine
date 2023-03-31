import { AnimationMixer, BufferGeometry, Mesh, Object3D } from 'three'

import { EntityUUID } from '@etherealengine/common/src/interfaces/EntityUUID'

import { AnimationComponent } from '../../avatar/components/AnimationComponent'
import { Engine } from '../../ecs/classes/Engine'
import { Entity } from '../../ecs/classes/Entity'
import {
  addComponent,
  ComponentMap,
  getComponent,
  removeComponent,
  setComponent
} from '../../ecs/functions/ComponentFunctions'
import { createEntity } from '../../ecs/functions/EntityFunctions'
import { addEntityNodeChild, EntityTreeComponent } from '../../ecs/functions/EntityTree'
import { setLocalTransformComponent, TransformComponent } from '../../transform/components/TransformComponent'
import { computeLocalTransformMatrix, computeTransformMatrix } from '../../transform/systems/TransformSystem'
import { GLTFLoadedComponent } from '../components/GLTFLoadedComponent'
import { addObjectToGroup, GroupComponent } from '../components/GroupComponent'
import { ModelComponent } from '../components/ModelComponent'
import { NameComponent } from '../components/NameComponent'
import { ObjectLayers } from '../constants/ObjectLayers'
import { deserializeComponent } from '../systems/SceneLoadingSystem'
import { setObjectLayers } from './setObjectLayers'

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
      const componentId = Engine.instance.sceneComponentRegistry.get(key)
      if (typeof componentId === 'string') {
        const deserialize = Engine.instance.sceneLoadingRegistry.get(componentId)?.deserialize
        if (typeof deserialize === 'function') deserialize(entity, value)
        else addComponent(entity, component, value)
      } else {
        addComponent(entity, component, value)
      }
      getComponent(entity, GLTFLoadedComponent).push(component)
    }
  }

  for (const [key, value] of Object.entries(prefabs)) {
    const component = Array.from(Engine.instance.sceneComponentRegistry).find(([_, prefab]) => prefab === key)?.[0]
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

    addEntityNodeChild(e, entity, mesh.uuid as EntityUUID)

    addComponent(e, NameComponent, mesh.userData['xrengine.entity'] ?? mesh.uuid)

    delete mesh.userData['xrengine.entity']
    delete mesh.userData.name

    // setTransformComponent(e, mesh.position, mesh.quaternion, mesh.scale)
    setLocalTransformComponent(e, entity, mesh.position, mesh.quaternion, mesh.scale)
    computeLocalTransformMatrix(entity)
    computeTransformMatrix(entity)

    addObjectToGroup(e, mesh)
    addComponent(e, GLTFLoadedComponent, ['entity', GroupComponent.name, TransformComponent.name])
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

  setObjectLayers(scene, ObjectLayers.Scene)

  // if the model has animations, we may have custom logic to initiate it. editor animations are loaded from `loop-animation` below
  if (scene.animations?.length) {
    // We only have to update the mixer time for this animations on each frame
    if (getComponent(entity, AnimationComponent)) removeComponent(entity, AnimationComponent)
    addComponent(entity, AnimationComponent, {
      mixer: new AnimationMixer(scene),
      animationSpeed: 1,
      animations: scene.animations
    })
  }
}
