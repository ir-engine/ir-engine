import { AnimationMixer, BufferGeometry, Mesh, Object3D, Quaternion, Vector3 } from 'three'
import { AssetLoader } from '../../assets/classes/AssetLoader'
import { EngineEvents } from '../../ecs/classes/EngineEvents'
import { Entity } from '../../ecs/classes/Entity'
import { addComponent, ComponentMap, getComponent } from '../../ecs/functions/ComponentFunctions'
import { createEntity } from '../../ecs/functions/EntityFunctions'
import { Object3DComponent } from '../components/Object3DComponent'
import { loadComponent } from '../functions/SceneLoading'
import { parseGeometry } from '../../common/functions/parseGeometry'
import { NavMesh, Polygon } from 'yuka'
import { NavMeshComponent } from '../../navigation/component/NavMeshComponent'
import { DebugNavMeshComponent } from '../../debug/DebugNavMeshComponent'
import { NameComponent } from '../components/NameComponent'
import { TransformComponent } from '../../transform/components/TransformComponent'
import { useWorld } from '../../ecs/functions/SystemHooks'
import { ModelComponent, ModelComponentType } from '../components/ModelComponent'
import { VIDEO_MESH_NAME } from './loaders/VideoFunctions'
import { accessEngineState } from '../../ecs/classes/EngineService'
import { ReplaceObject3DComponent } from '../components/ReplaceObject3DComponent'
import { receiveActionOnce } from '../../networking/functions/matchActionOnce'
import { GLTF } from '../../assets/loaders/gltf/GLTFLoader'
import { setObjectLayers } from './setObjectLayers'
import { ObjectLayers } from '../constants/ObjectLayers'
import { AnimationComponent } from '../../avatar/components/AnimationComponent'
import { dispatchFrom } from '../../networking/functions/dispatchFrom'
import { NetworkWorldAction } from '../../networking/functions/NetworkWorldAction'
import { applyTransformToMeshWorld } from '../../physics/functions/parseModelColliders'

export const createObjectEntityFromGLTF = (entity: Entity, object3d?: Object3D): void => {
  const obj3d = object3d ?? getComponent(entity, Object3DComponent).value
  const components: { [key: string]: any } = {}
  const prefabs: { [key: string]: any } = {}
  const data = Object.entries(obj3d.userData)

  for (const [key, value] of data) {
    const parts = key.split('.')
    if (parts.length > 1) {
      // TODO: deprecate xrengine
      if (parts[0] === 'realitypack' || parts[0] === 'xrengine') {
        const componentExists = ComponentMap.has(parts[1])
        const _toLoad = componentExists ? components : prefabs
        if (typeof _toLoad[parts[1]] === 'undefined') {
          _toLoad[parts[1]] = {}
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
      addComponent(entity, component, value)
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
    if ('xrengine.entity' in mesh.userData || 'realitypack.entity' in mesh.userData) {
      meshesToProcess.push(mesh)
    }
  })

  if (meshesToProcess.length === 0) {
    createObjectEntityFromGLTF(entity, object3d)
    return
  }

  for (const mesh of meshesToProcess) {
    if (mesh === obj3d) {
      createObjectEntityFromGLTF(entity, object3d)
      continue
    }

    const e = createEntity()
    addComponent(e, NameComponent, {
      name: mesh.userData['xrengine.entity'] ?? mesh.userData['realitypack.entity'] ?? mesh.uuid
    })

    delete mesh.userData['xrengine.entity']
    delete mesh.userData['realitypack.entity']
    delete mesh.userData.name

    // apply root mesh's world transform to this mesh locally
    applyTransformToMeshWorld(entity, mesh)
    addComponent(e, TransformComponent, {
      position: mesh.getWorldPosition(new Vector3()),
      rotation: mesh.getWorldQuaternion(new Quaternion()),
      scale: mesh.getWorldScale(new Vector3())
    })

    mesh.removeFromParent()
    addComponent(e, Object3DComponent, { value: mesh })

    createObjectEntityFromGLTF(e)
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
    // Engine.scene.add(helper)

    addComponent(entity, NavMeshComponent, {
      yukaNavMesh: navMesh,
      navTarget: obj3d
    })
    addComponent(entity, DebugNavMeshComponent, null!)
  }
}

export const overrideTexture = (entity: Entity, object3d?: Object3D, world = useWorld()): void => {
  const state = accessEngineState()

  if (state.sceneLoaded.value) {
    const modelComponent = getComponent(entity, ModelComponent)
    const node = world.entityTree.findNodeFromUUID(modelComponent.textureOverride)

    if (node) {
      const obj3d = object3d ?? getComponent(entity, Object3DComponent).value
      const textureObj3d = getComponent(node.entity, Object3DComponent).value

      textureObj3d.traverse((mesh: Mesh) => {
        if (mesh.name === VIDEO_MESH_NAME) {
          obj3d.traverse((obj: Mesh) => {
            if (obj.material) obj.material = mesh.material
          })
        }
      })
    }

    return
  } else {
    receiveActionOnce(EngineEvents.EVENTS.SCENE_LOADED, () => {
      overrideTexture(entity, object3d, world)
    })
  }
}

export const parseGLTFModel = (entity: Entity, props: ModelComponentType, obj3d: Object3D) => {
  setObjectLayers(obj3d, ObjectLayers.Render, ObjectLayers.Scene)

  // DIRTY HACK TO LOAD NAVMESH
  if (props.src.match(/navmesh/)) {
    loadNavmesh(entity, obj3d)
  }

  // if the model has animations, we may have custom logic to initiate it. editor animations are loaded from `loop-animation` below
  if (obj3d.animations?.length) {
    // We only have to update the mixer time for this animations on each frame
    addComponent(entity, AnimationComponent, {
      mixer: new AnimationMixer(obj3d),
      animationSpeed: 1,
      animations: obj3d.animations
    })
  }

  const world = useWorld()

  if (props.textureOverride) {
    // TODO: we should push this to ECS, something like a SceneObjectLoadComponent,
    // or add engine events for specific objects being added to the scene,
    // the scene load event + delay 1 second delay works for now.
    overrideTexture(entity, obj3d, world)
  }

  if (props.isDynamicObject) {
    const node = world.entityTree.findNodeFromEid(entity)
    if (node) {
      dispatchFrom(world.hostId, () =>
        NetworkWorldAction.spawnObject({ prefab: '', parameters: { sceneEntityId: node.uuid } })
      ).cache()
    }
  } else {
    if (props.matrixAutoUpdate === false) {
      obj3d.traverse((child) => {
        child.updateMatrixWorld(true)
        child.matrixAutoUpdate = false
      })
    }
  }

  parseObjectComponentsFromGLTF(entity, obj3d)

  const modelComponent = getComponent(entity, ModelComponent)
  if (modelComponent) modelComponent.parsed = true
}

export const loadGLTFModel = (entity: Entity): Promise<GLTF | undefined> => {
  const modelComponent = getComponent(entity, ModelComponent)

  return new Promise<GLTF | undefined>((resolve, reject) => {
    AssetLoader.load(
      { url: modelComponent.src, entity, instanced: modelComponent.isUsingGPUInstancing },
      (res) => {
        if (res.scene instanceof Object3D) {
          // TODO: refactor this
          addComponent(entity, ReplaceObject3DComponent, { replacement: res })
          res.scene.animations = res.animation
          resolve(res)
        } else {
          reject({ message: 'Not a valid object' })
        }
      },
      null!,
      (err) => {
        reject(err)
      }
    )
  })
}
