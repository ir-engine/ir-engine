import { AnimationMixer, BufferGeometry, Mesh, Quaternion, Scene, Vector3 } from 'three'
import { AssetLoader } from '../../assets/classes/AssetLoader'
import { AnimationComponent } from '../../avatar/components/AnimationComponent'
import { Engine } from '../../ecs/classes/Engine'
import { EngineEvents } from '../../ecs/classes/EngineEvents'
import { Entity } from '../../ecs/classes/Entity'
import { addComponent, ComponentMap, getComponent } from '../../ecs/functions/ComponentFunctions'
import { createEntity } from '../../ecs/functions/EntityFunctions'
import { Object3DComponent } from '../components/Object3DComponent'
import { SceneDataComponent, loadComponent } from '../functions/SceneLoading'
import { parseGeometry } from '../../common/functions/parseGeometry'
import * as YUKA from 'yuka'
import { NavMeshComponent } from '../../navigation/component/NavMeshComponent'
import { delay } from '../../common/functions/delay'
import { DebugNavMeshComponent } from '../../debug/DebugNavMeshComponent'
import { NameComponent } from '../components/NameComponent'
import { TransformComponent } from '../../transform/components/TransformComponent'
import { ObjectLayers } from '../constants/ObjectLayers'
import { setObjectLayers } from './setObjectLayers'
import { dispatchFrom } from '../../networking/functions/dispatchFrom'
import { useWorld } from '../../ecs/functions/SystemHooks'
import { NetworkWorldAction } from '../../networking/functions/NetworkWorldAction'
import { EngineActionType } from '../../ecs/classes/EngineService'
import { receiveActionOnce } from '../../networking/functions/matchActionOnce'

export const createObjectEntityFromGLTF = (e: Entity, mesh: Mesh) => {
  const components: { [key: string]: any } = {}
  const prefabs: { [key: string]: any } = {}
  const data = Object.entries(mesh.userData)

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
        delete mesh.userData[key]
      }
    }
  }
  for (const [key, value] of Object.entries(components)) {
    const component = ComponentMap.get(key)
    if (typeof component === 'undefined') {
      console.warn(`Could not load component '${key}'`)
    } else {
      addComponent(e, component, value)
    }
  }
  for (const [key, value] of Object.entries(prefabs)) {
    const prefab = {
      name: key,
      data: value,
      sceneEntityId: mesh.uuid
    } as any as SceneDataComponent
    loadComponent(e, prefab)
  }
}

export const parseObjectComponentsFromGLTF = (entity: Entity, res: Mesh | Scene) => {
  const meshesToProcess: Mesh[] = []

  res.traverse((mesh: Mesh) => {
    if ('xrengine.entity' in mesh.userData || 'realitypack.entity' in mesh.userData) {
      meshesToProcess.push(mesh)
    }
  })

  if (meshesToProcess.length === 0) {
    createObjectEntityFromGLTF(entity, res as Mesh)
  } else {
    for (const mesh of meshesToProcess) {
      if (mesh === res) {
        createObjectEntityFromGLTF(entity, mesh)
      } else {
        const e = createEntity()
        addComponent(e, NameComponent, {
          name: mesh.userData['xrengine.entity'] ?? mesh.userData['realitypack.entity'] ?? mesh.uuid
        })
        delete mesh.userData['xrengine.entity']
        delete mesh.userData['realitypack.entity']
        delete mesh.userData.name

        // apply root mesh's world transform to this mesh locally
        // applyTransformToMeshWorld(entity, mesh)
        addComponent(e, TransformComponent, {
          position: mesh.getWorldPosition(new Vector3()),
          rotation: mesh.getWorldQuaternion(new Quaternion()),
          scale: mesh.getWorldScale(new Vector3())
        })
        mesh.removeFromParent()
        addComponent(e, Object3DComponent, { value: mesh })

        createObjectEntityFromGLTF(e, mesh)
      }
    }
  }
}

export const parseGLTFModel = (entity: Entity, component: SceneDataComponent, scene: Mesh | Scene) => {
  // console.log('parseGLTFModel', entity, component, scene)

  const world = useWorld()
  setObjectLayers(scene, ObjectLayers.Render, ObjectLayers.Scene)
  addComponent(entity, Object3DComponent, { value: scene })

  const transform = getComponent(entity, TransformComponent)
  if (transform) {
    scene.position.copy(transform.position)
    scene.quaternion.copy(transform.rotation)
    scene.scale.copy(transform.scale)
    scene.updateMatrixWorld()
  }

  // DIRTY HACK TO LOAD NAVMESH
  if (component.data.src.match(/navmesh/)) {
    console.log('generate navmesh')
    let polygons: any[] = []
    scene.traverse((child: Mesh) => {
      child.visible = false
      if (typeof child.geometry !== 'undefined' && child.geometry instanceof BufferGeometry) {
        const childPolygons = parseGeometry({
          position: child.geometry.attributes.position.array as number[],
          index: child.geometry.index?.array as number[]
        })
        if (childPolygons?.length) {
          polygons = polygons.concat(childPolygons)
        }
      }
    })
    if (polygons.length) {
      const navMesh = new YUKA.NavMesh()
      navMesh.fromPolygons(polygons)
      // const helper = createConvexRegionHelper(navMesh)
      // Engine.scene.add(helper)

      console.log('navMesh', navMesh)
      addComponent(entity, NavMeshComponent, {
        yukaNavMesh: navMesh,
        navTarget: scene
      })
      addComponent(entity, DebugNavMeshComponent, null!)
    }
  }

  // if the model has animations, we may have custom logic to initiate it. editor animations are loaded from `loop-animation` below
  if (scene.animations?.length) {
    console.log('scene.animations', scene.animations)
    // We only have to update the mixer time for this animations on each frame
    const object3d = getComponent(entity, Object3DComponent)
    const mixer = new AnimationMixer(object3d.value)

    addComponent(entity, AnimationComponent, {
      mixer,
      animationSpeed: 1,
      animations: scene.animations
    })
  }

  if (component.data.textureOverride) {
    // we should push this to ECS, something like a SceneObjectLoadComponent,
    // or add engine events for specific objects being added to the scene,
    // the scene load event + delay 1 second delay works for now.
    const onSceneLoaded = async () => {
      await delay(1000)
      const objToCopy = Engine.scene.children.find((obj: any) => {
        return obj.sceneEntityId === component.data.textureOverride
      })
      if (objToCopy)
        objToCopy.traverse((videoMesh: any) => {
          if (videoMesh.name === 'VideoMesh') {
            getComponent(entity, Object3DComponent)?.value?.traverse((obj: any) => {
              if (obj.material) {
                obj.material = videoMesh.material
              }
            })
          }
        })
    }
    receiveActionOnce(EngineEvents.EVENTS.SCENE_LOADED, onSceneLoaded)
  }

  if (
    component.data.isDynamicObject === false &&
    typeof component.data.matrixAutoUpdate !== 'undefined' &&
    component.data.matrixAutoUpdate === false
  ) {
    scene.traverse((child) => {
      child.updateMatrixWorld(true)
      child.matrixAutoUpdate = false
    })
  }

  if (component.data.isDynamicObject) {
    ;(scene as any).sceneEntityId = component.data.sceneEntityId
    dispatchFrom(world.hostId, () =>
      NetworkWorldAction.spawnObject({
        prefab: '',
        parameters: {
          sceneEntityId: component.data.sceneEntityId
        }
      })
    ).cache()
  }

  parseObjectComponentsFromGLTF(entity, scene)
}

export const loadGLTFModel = (entity: Entity, component: SceneDataComponent) => {
  return new Promise<void>((resolve, reject) => {
    AssetLoader.load(
      {
        url: component.data.src,
        entity
      },
      (res) => {
        parseGLTFModel(entity, component, res.scene)
        resolve()
      },
      null!,
      (err) => {
        console.log('[SCENE-LOADING]:', err)
        reject(err)
      },
      component.data.isUsingGPUInstancing
    )
  })
}
