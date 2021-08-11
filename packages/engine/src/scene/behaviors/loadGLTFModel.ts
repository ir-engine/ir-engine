import { AnimationMixer, BufferGeometry, Object3D } from 'three'
import { AssetLoader } from '../../assets/classes/AssetLoader'
import { AnimationComponent } from '../../avatar/components/AnimationComponent'
import { Engine } from '../../ecs/classes/Engine'
import { EngineEvents } from '../../ecs/classes/EngineEvents'
import { Entity } from '../../ecs/classes/Entity'
import { addComponent, getComponent } from '../../ecs/functions/EntityFunctions'
import { applyTransformToMesh, createCollidersFromModel } from '../../physics/behaviors/parseModelColliders'
import { Object3DComponent } from '../components/Object3DComponent'
import { ScenePropertyType, WorldScene } from '../functions/SceneLoading'
import { SceneDataComponent } from '../interfaces/SceneDataComponent'
import { parseGeometry } from '../../map/parseGeometry'
import * as YUKA from 'yuka'
import { NavMeshComponent } from '../../navigation/component/NavMeshComponent'
import { createConvexRegionHelper } from '../../navigation/NavMeshHelper'
import { delay } from '../../common/functions/delay'
import { DebugNavMeshComponent } from '../../debug/DebugNavMeshComponent'

export const loadGLTFModel = (
  sceneLoader: WorldScene,
  entity: Entity,
  component: SceneDataComponent,
  sceneProperty: ScenePropertyType
) => {
  sceneLoader.loaders.push(
    new Promise<void>((resolve, reject) => {
      AssetLoader.load(
        {
          url: component.data.src,
          entity
        },
        (res) => {
          createCollidersFromModel(entity, res)

          // DIRTY HACK TO LOAD NAVMESH
          if (component.data.src.match(/navmesh/)) {
            console.log('generate navmesh')
            let polygons = []
            res.traverse((child) => {
              child.visible = false
              if (typeof child.geometry !== 'undefined' && child.geometry instanceof BufferGeometry) {
                const childPolygons = parseGeometry({
                  position: child.geometry.attributes.position.array,
                  index: child.geometry.index.array
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
                yukaNavMesh: navMesh
              })
              addComponent(entity, DebugNavMeshComponent, null)
            }
          }

          // if the model has animations, we may have custom logic to initiate it. editor animations are loaded from `loop-animation` below
          if (res.animations) {
            // We only have to update the mixer time for this animations on each frame
            const object3d = getComponent(entity, Object3DComponent)
            const mixer = new AnimationMixer(object3d.value)

            addComponent(entity, AnimationComponent, {
              mixer,
              animationSpeed: 1,
              animations: res.animations
            })
          }

          if (component.data.textureOverride) {
            // we should push this to ECS, something like a SceneObjectLoadComponent,
            // or add engine events for specific objects being added to the scene,
            // the scene load event + delay 1 second delay works for now.
            EngineEvents.instance.once(EngineEvents.EVENTS.SCENE_LOADED, async () => {
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
            })
          }

          if (typeof component.data.matrixAutoUpdate !== 'undefined' && component.data.matrixAutoUpdate === false) {
            applyTransformToMesh(entity, res)
            res.traverse((child) => {
              child.updateMatrixWorld(true)
              child.matrixAutoUpdate = false
            })
          }

          sceneLoader._onModelLoaded()
          resolve()
        },
        null,
        (err) => {
          console.log('[SCENE-LOADING]:', err)
          sceneLoader._onModelLoaded()
          reject(err)
        }
      )
    })
  )
}
