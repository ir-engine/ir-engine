import { AnimationMixer, BufferGeometry, Mesh, Object3D } from 'three'
import { NavMesh, Polygon } from 'yuka'

import { AnimationComponent } from '../../avatar/components/AnimationComponent'
import { parseGeometry } from '../../common/functions/parseGeometry'
import { DebugNavMeshComponent } from '../../debug/DebugNavMeshComponent'
import { Engine } from '../../ecs/classes/Engine'
import { Entity } from '../../ecs/classes/Entity'
import { addComponent, ComponentMap, getComponent, removeComponent } from '../../ecs/functions/ComponentFunctions'
import { createEntity } from '../../ecs/functions/EntityFunctions'
import { addEntityNodeInTree, createEntityNode } from '../../ecs/functions/EntityTreeFunctions'
import { NavMeshComponent } from '../../navigation/component/NavMeshComponent'
import { applyTransformToMeshWorld } from '../../physics/functions/parseModelColliders'
import { setComputedTransformComponent } from '../../transform/components/ComputedTransformComponent'
import { setLocalTransformComponent } from '../../transform/components/LocalTransformComponent'
import { setTransformComponent, TransformComponent } from '../../transform/components/TransformComponent'
import { EntityNodeComponent } from '../components/EntityNodeComponent'
import { ModelComponent } from '../components/ModelComponent'
import { NameComponent } from '../components/NameComponent'
import { Object3DComponent } from '../components/Object3DComponent'
import { ObjectLayers } from '../constants/ObjectLayers'
import { loadComponent } from '../functions/SceneLoading'
import { applyTransformPositionOffset, applyTransformRotationOffset } from './loaders/TransformFunctions'
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
    }
  }

  for (const [key, value] of Object.entries(prefabs)) {
    loadComponent(entity, {
      name: key,
      props: value
    })
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

    addComponent(e, EntityNodeComponent, { components: [] })

    if (Engine.instance.isEditor)
      // store local transform in local transform component
      setLocalTransformComponent(e, mesh.position, mesh.quaternion, mesh.scale)

    // apply root mesh's world transform to this mesh locally
    applyTransformToMeshWorld(entity, mesh)

    const transform = setTransformComponent(e)
    mesh.getWorldPosition(transform.position)
    mesh.getWorldQuaternion(transform.rotation)
    mesh.getWorldScale(transform.scale)

    mesh.removeFromParent()
    addComponent(e, Object3DComponent, { value: mesh })

    createObjectEntityFromGLTF(e, mesh)
  }
}

export const loadNavmesh = (entity: Entity, object3d?: Object3D): void => {
  const obj3d = object3d ?? getComponent(entity, Object3DComponent).value
  let polygons = [] as Polygon[]

  obj3d.traverse((child: Mesh) => {
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
      navTarget: obj3d
    })
    addComponent(entity, DebugNavMeshComponent, null!)
  }
}

export const parseGLTFModel = (entity: Entity) => {
  const props = getComponent(entity, ModelComponent)
  const obj3d = getComponent(entity, Object3DComponent).value

  // always parse components first
  parseObjectComponentsFromGLTF(entity, obj3d)

  setObjectLayers(obj3d, ObjectLayers.Scene)

  // DIRTY HACK TO LOAD NAVMESH
  if (props.src.match(/navmesh/)) {
    loadNavmesh(entity, obj3d)
  }

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

  const world = Engine.instance.currentWorld

  if (!Engine.instance.isEditor && world.worldNetwork?.isHosting /**&& props.isDynamicObject*/) {
    const node = world.entityTree.entityNodeMap.get(entity)
    if (node) {
      // dispatchAction(
      //   WorldNetworkAction.spawnObject({
      //     prefab: 'scene_object',
      //     parameters: { sceneEntityId: node.uuid }
      //   }),
      //   Engine.instance.currentWorld.worldNetwork.hostId
      // )
    }
  }

  // ignore disabling matrix auto update in the editor as we need to be able move things around with the transform tools
  if (!Engine.instance.isEditor && props.matrixAutoUpdate === false) {
    const transform = getComponent(entity, TransformComponent)
    obj3d.position.copy(transform.position)
    obj3d.quaternion.copy(transform.rotation)
    obj3d.scale.copy(transform.scale)
    obj3d.updateMatrixWorld(true)
    obj3d.traverse((child) => {
      child.matrixAutoUpdate = false
    })
  }

  const modelComponent = getComponent(entity, ModelComponent)
  if (modelComponent) modelComponent.parsed = true
}
