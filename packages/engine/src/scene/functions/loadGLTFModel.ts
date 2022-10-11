import { AnimationMixer, BufferGeometry, Mesh, Object3D } from 'three'
import { NavMesh, Polygon } from 'yuka'

import { AnimationComponent } from '../../avatar/components/AnimationComponent'
import { parseGeometry } from '../../common/functions/parseGeometry'
import { DebugNavMeshComponent } from '../../debug/DebugNavMeshComponent'
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
import { addEntityNodeChild, createEntityNode } from '../../ecs/functions/EntityTree'
import { NavMeshComponent } from '../../navigation/component/NavMeshComponent'
import {
  setLocalTransformComponent,
  setTransformComponent,
  TransformComponent
} from '../../transform/components/TransformComponent'
import { GLTFLoadedComponent } from '../components/GLTFLoadedComponent'
import { addObjectToGroup, GroupComponent } from '../components/GroupComponent'
import { ModelComponent } from '../components/ModelComponent'
import { NameComponent } from '../components/NameComponent'
import { ObjectLayers } from '../constants/ObjectLayers'
import { deserializeComponent } from '../systems/SceneLoadingSystem'
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
          _toLoad[parts[1]] = {}
        }
        if (parts.length > 2) {
          let val = value
          if (value === 'true') val = true
          if (value === 'false') val = false
          _toLoad[parts[1]][parts[2]] = val
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
      const world = Engine.instance.currentWorld
      const componentId = world.sceneComponentRegistry.get(key)
      if (typeof componentId === 'string') {
        const deserialize = Engine.instance.currentWorld.sceneLoadingRegistry.get(componentId)?.deserialize
        if (typeof deserialize === 'function') deserialize(entity, value)
        else addComponent(entity, component, value, Engine.instance.currentWorld)
      } else {
        addComponent(entity, component, value, Engine.instance.currentWorld)
      }
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
      deserializeComponent(entity, {
        name: key,
        props: value
      })
    }
  }
}

export const parseObjectComponentsFromGLTF = (entity: Entity, object3d?: Object3D): void => {
  const scene = object3d ?? getComponent(entity, ModelComponent).scene.value
  const meshesToProcess: Mesh[] = []

  if (!scene) return

  scene.traverse((mesh: Mesh) => {
    if ('xrengine.entity' in mesh.userData) {
      meshesToProcess.push(mesh)
    }
  })

  if (meshesToProcess.length === 0) {
    setComponent(entity, GLTFLoadedComponent, [])
    scene.traverse((obj) => createObjectEntityFromGLTF(entity, obj))
    return
  }

  for (const mesh of meshesToProcess) {
    const e = createEntity()

    const node = createEntityNode(e, mesh.uuid)
    addEntityNodeChild(node, Engine.instance.currentWorld.entityTree.entityNodeMap.get(entity)!)

    addComponent(e, NameComponent, {
      name: mesh.userData['xrengine.entity'] ?? mesh.uuid
    })

    delete mesh.userData['xrengine.entity']
    delete mesh.userData.name

    // setTransformComponent(e, mesh.position, mesh.quaternion, mesh.scale)
    setLocalTransformComponent(e, entity, mesh.position, mesh.quaternion, mesh.scale)
    addObjectToGroup(e, mesh)
    addComponent(e, GLTFLoadedComponent, ['entity', GroupComponent.name, TransformComponent._name])
    createObjectEntityFromGLTF(e, mesh)
  }
}

export const loadNavmesh = (entity: Entity, object3d?: Object3D): void => {
  const scene = object3d ?? getComponent(entity, ModelComponent).scene.value
  let polygons = [] as Polygon[]

  if (!scene) return

  scene.traverse((child: Mesh) => {
    child.visible = false

    if (!child.geometry || !(child.geometry instanceof BufferGeometry)) return

    const childPolygons = parseGeometry({
      position: child.geometry.attributes.position.array as number[],
      index: child.geometry.index ? (child.geometry.index.array as number[]) : []
    })

    if (childPolygons.length) polygons = polygons.concat(childPolygons)
  })

  if (polygons.length) {
    const navMesh = new NavMesh()
    navMesh.fromPolygons(polygons)

    // const helper = createConvexRegionHelper(navMesh)
    // Engine.instance.currentWorld.scene.add(helper)

    addComponent(entity, NavMeshComponent, {
      yukaNavMesh: navMesh,
      navTarget: scene
    })
    addComponent(entity, DebugNavMeshComponent, null!)
  }
}

export const parseGLTFModel = (entity: Entity) => {
  const model = getComponent(entity, ModelComponent)
  if (!model.scene.value) return
  const scene = model.scene.value
  scene.updateMatrixWorld(true)
  scene.traverse((child) => {
    child.matrixAutoUpdate = model.matrixAutoUpdate.value
  })

  // always parse components first
  parseObjectComponentsFromGLTF(entity, scene)

  setObjectLayers(scene, ObjectLayers.Scene)

  // DIRTY HACK TO LOAD NAVMESH
  if (model.src.value.match(/navmesh/)) {
    loadNavmesh(entity, scene)
  }

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
