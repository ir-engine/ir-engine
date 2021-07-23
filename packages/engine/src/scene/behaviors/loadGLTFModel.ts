import { AnimationMixer } from 'three'
import { AssetLoader } from '../../assets/classes/AssetLoader'
import { AnimationState } from '../../character/animations/AnimationState'
import { AnimationComponent } from '../../character/components/AnimationComponent'
import { isClient } from '../../common/functions/isClient'
import { Engine } from '../../ecs/classes/Engine'
import { EngineEvents } from '../../ecs/classes/EngineEvents'
import { Entity } from '../../ecs/classes/Entity'
import { delay } from '../../ecs/functions/EngineFunctions'
import { addComponent, getComponent, getMutableComponent } from '../../ecs/functions/EntityFunctions'
import { removeCollidersFromModel } from '../../physics/behaviors/parseModelColliders'
import { Object3DComponent } from '../components/Object3DComponent'
import { ScenePropertyType, WorldScene } from '../functions/SceneLoading'
import { SceneDataComponent } from '../interfaces/SceneDataComponent'

export const loadGLTFModel = (
  sceneLoader: WorldScene,
  entity: Entity,
  component: SceneDataComponent,
  sceneProperty: ScenePropertyType
) => {
  if (isClient) {
    sceneLoader.loaders.push(
      new Promise<void>((resolve) => {
        AssetLoader.load(
          {
            url: component.data.src,
            entity
          },
          (res) => {
            removeCollidersFromModel(entity, res)

            // if the model has animations, we may have custom logic to initiate it. editor animations are loaded from `loop-animation` below
            if (res.animations) {
              // We only have to update the mixer time for this animations on each frame
              addComponent(entity, AnimationComponent, { onlyUpdateMixerTime: true })
              const animationComponent = getMutableComponent(entity, AnimationComponent)
              animationComponent.animations = res.animations
              const object3d = getMutableComponent(entity, Object3DComponent)

              animationComponent.mixer = new AnimationMixer(object3d.value)
              animationComponent.currentState = new AnimationState()
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
            sceneLoader._onModelLoaded()
            resolve()
          },
          null,
          (err) => {
            sceneLoader._onModelLoaded()
            resolve()
          }
        )
      })
    )
  }
}
