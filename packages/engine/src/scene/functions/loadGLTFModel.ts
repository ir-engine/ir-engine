import { AnimationMixer, BufferGeometry, Mesh, Object3D } from 'three'

import { AnimationComponent } from '../../avatar/components/AnimationComponent'
import { Engine } from '../../ecs/classes/Engine'
import { Entity } from '../../ecs/classes/Entity'
import {
  addComponent,
  ComponentMap,
  getComponent,
  hasComponent,
  removeComponent,
  setComponent
} from '../../ecs/functions/ComponentFunctions'
import { createEntity } from '../../ecs/functions/EntityFunctions'
import { addEntityNodeInTree, createEntityNode } from '../../ecs/functions/EntityTreeFunctions'
import { applyTransformToMeshWorld } from '../../physics/functions/parseModelColliders'
import { setLocalTransformComponent } from '../../transform/components/LocalTransformComponent'
import { setTransformComponent, TransformComponent } from '../../transform/components/TransformComponent'
import { GLTFLoadedComponent } from '../components/GLTFLoadedComponent'
import { ModelComponent } from '../components/ModelComponent'
import { NameComponent } from '../components/NameComponent'
import { Object3DComponent } from '../components/Object3DComponent'
import { ObjectLayers } from '../constants/ObjectLayers'
import { loadComponent } from '../systems/SceneLoadingSystem'
import { setObjectLayers } from './setObjectLayers'

export const createObjectEntityFromGLTF = (entity: Entity, obj3d: Object3D): void => {
  const components: { [key: string]: any } = {}
  const prefabs: { [key: string]: any } = {}
  const data = Object.entries(obj3d.userData)

  for (const [key, value] of data) {
    const parts = key.split('.')
    if (parts.length > 1) {
      if (parts[0] === 'xrengine') {
        const componentExists = ComponentMap.has(parts[1])
        const _toLoad = componentExists ? components : prefabs
        if (typeof _toLoad[parts[1]] === 'undefined') {
          _toLoad[parts[1]] = {
            [parts[2]]: value,
            ...obj3d.userData
          }
          obj3d.userData[parts[2]] = value
        }
        if (parts.length > 2) {
          _toLoad[parts[1]][parts[2]] = value
        }
        delete obj3d.userData[key]
      }
    }
  }

  for (const [key, value] of Object.entries(components)) {
    const component = ComponentMap.get(key)
    if (typeof component === 'undefined') {
      console.warn(`Could not load component '${key}'`)
    } else {
      addComponent(entity, component, value, Engine.instance.currentWorld)
      getComponent(entity, GLTFLoadedComponent).push(component)
    }
  }

  for (const [key, value] of Object.entries(prefabs)) {
    const component = Array.from(Engine.instance.currentWorld.sceneComponentRegistry).find(
      ([_, prefab]) => prefab === key
    )?.[0]
    if (typeof component === 'undefined') {
      console.warn(`Could not load component '${component}'`)
    } else {
      getComponent(entity, GLTFLoadedComponent).push(component)
      loadComponent(entity, {
        name: key,
        props: value
      })
    }
  }
}

export const parseObjectComponentsFromGLTF = (entity: Entity, object3d?: Object3D): void => {
  const obj3d = object3d ?? getComponent(entity, Object3DComponent).value
  const meshesToProcess: Mesh[] = []

  obj3d.traverse((mesh: Mesh) => {
    if ('xrengine.entity' in mesh.userData) {
      meshesToProcess.push(mesh)
    }
  })

  if (meshesToProcess.length === 0) {
    setComponent(entity, GLTFLoadedComponent, [])
    obj3d.traverse((obj) => createObjectEntityFromGLTF(entity, obj))
    return
  }

  for (const mesh of meshesToProcess) {
    const e = createEntity()

    const node = createEntityNode(e, mesh.uuid)
    addEntityNodeInTree(node, Engine.instance.currentWorld.entityTree.entityNodeMap.get(entity))

    addComponent(e, NameComponent, {
      name: mesh.userData['xrengine.entity'] ?? mesh.uuid
    })

    delete mesh.userData['xrengine.entity']
    delete mesh.userData.name

    if (Engine.instance.isEditor)
      // store local transform in local transform component
      setLocalTransformComponent(e, mesh.position, mesh.quaternion, mesh.scale)

    // apply root mesh's world transform to this mesh locally
    applyTransformToMeshWorld(entity, mesh)

    const transform = setTransformComponent(e)
    mesh.updateWorldMatrix(true, true)
    mesh.getWorldPosition(transform.position)
    mesh.getWorldQuaternion(transform.rotation)
    mesh.getWorldScale(transform.scale)

    mesh.removeFromParent()
    if (mesh.userData['xrengine.removeMesh'] === 'true') {
      delete mesh.userData['xrengine.removeMesh']
    } else {
      addComponent(e, Object3DComponent, { value: mesh })
    }

    addComponent(e, GLTFLoadedComponent, ['entity', TransformComponent._name])
    createObjectEntityFromGLTF(e, mesh)
  }
}

export const parseGLTFModel = (entity: Entity) => {
  const props = getComponent(entity, ModelComponent)
  const obj3d = getComponent(entity, Object3DComponent).value

  // always parse components first
  parseObjectComponentsFromGLTF(entity, obj3d)

  setObjectLayers(obj3d, ObjectLayers.Scene)

  // if the model has animations, we may have custom logic to initiate it. editor animations are loaded from `loop-animation` below
  if (obj3d.animations?.length) {
    // We only have to update the mixer time for this animations on each frame
    if (getComponent(entity, AnimationComponent)) removeComponent(entity, AnimationComponent)
    addComponent(entity, AnimationComponent, {
      mixer: new AnimationMixer(obj3d),
      animationSpeed: 1,
      animations: obj3d.animations
    })
  }

  // ignore disabling matrix auto update in the editor as we need to be able move things around with the transform tools
  const transform = getComponent(entity, TransformComponent)
  obj3d.position.copy(transform.position)
  obj3d.quaternion.copy(transform.rotation)
  obj3d.scale.copy(transform.scale)
  obj3d.updateMatrixWorld(true)
  obj3d.traverse((child) => {
    child.matrixAutoUpdate = props.matrixAutoUpdate
  })
}
