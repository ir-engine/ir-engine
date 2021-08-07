import { Material, Mesh, MeshBasicMaterial, MeshPhongMaterial, MeshStandardMaterial, Vector3 } from 'three'
import { CameraLayers } from '../../camera/constants/CameraLayers'
import { Engine } from '../../ecs/classes/Engine'
import { System } from '../../ecs/classes/System'
import { getComponent } from '../../ecs/functions/EntityFunctions'
import { beforeMaterialCompile } from '../../editor/nodes/helper/BPCEMShader'
import { Object3DComponent } from '../components/Object3DComponent'
import { PersistTagComponent } from '../components/PersistTagComponent'
import { ShadowComponent } from '../components/ShadowComponent'

/**
 * @author Josh Field <github.com/HexaField>
 */

// TODO: refactor this to be named something more generic like ObjectSystem, add object-object interactions (physics & non physics)
// GameManagerSystem already has physics interaction behaviors, these could be made generic and not game dependent

type BPCEMProps = {
  probeScale: Vector3
  probePositionOffset: Vector3
}

export class SceneOptions {
  static instance: SceneOptions
  bpcemOptions: BPCEMProps = {
    probeScale: new Vector3(1, 1, 1),
    probePositionOffset: new Vector3()
  }
  envMapIntensity = 1
  boxProjection = false
}

export class SceneObjectSystem extends System {
  constructor() {
    super()
    SceneOptions.instance = new SceneOptions()
  }

  /** Executes the system. */
  execute(deltaTime, time): void {
    for (const entity of this.queryResults.sceneObject.added) {
      const object3DComponent = getComponent(entity, Object3DComponent)
      const shadowComponent = getComponent(entity, ShadowComponent)

      ;(object3DComponent.value as any).entity = entity

      // Add to scene
      if (!Engine.scene.children.includes(object3DComponent.value)) {
        Engine.scene.add(object3DComponent.value)
      } else {
        console.warn('[Object3DComponent]: Scene object has been added manually.')
      }

      // Apply material stuff
      object3DComponent.value.traverse((obj: Mesh) => {
        const material = obj.material as Material
        if (typeof material !== 'undefined') material.dithering = true

        if (shadowComponent) {
          obj.receiveShadow = shadowComponent.receiveShadow
          obj.castShadow = shadowComponent.castShadow
        }

        if (Engine.simpleMaterials) {
          // || Engine.isHMD) {
          if (obj.material instanceof MeshStandardMaterial) {
            const prevMaterial = obj.material
            obj.material = new MeshPhongMaterial()
            MeshBasicMaterial.prototype.copy.call(obj.material, prevMaterial)
          }
        } else {
          const material = obj.material as Material
          if (typeof material !== 'undefined') {
            // BPCEM
            if (SceneOptions.instance.boxProjection)
              material.onBeforeCompile = beforeMaterialCompile(
                SceneOptions.instance.bpcemOptions.probeScale,
                SceneOptions.instance.bpcemOptions.probePositionOffset
              )
            ;(material as any).envMapIntensity = SceneOptions.instance.envMapIntensity
            if (obj.receiveShadow) {
              Engine.csm?.setupMaterial(material)
            }
          }
        }
      })
    }

    for (const entity of this.queryResults.sceneObject.removed) {
      const object3DComponent = getComponent(entity, Object3DComponent, true)

      // Remove from scene
      if (object3DComponent && Engine.scene.children.includes(object3DComponent.value)) {
        Engine.scene.remove(object3DComponent.value)
      } else {
        console.warn('[Object3DComponent]: Scene object has been removed manually.')
      }
    }

    // Enable second camera layer for persistant entities for fun portal effects
    for (const entity of this.queryResults.persist.added) {
      const object3DComponent = getComponent(entity, Object3DComponent)
      object3DComponent?.value?.traverse((obj) => {
        obj.layers.enable(CameraLayers.Portal)
      })
    }
  }
}

SceneObjectSystem.queries = {
  sceneObject: {
    components: [Object3DComponent],
    listen: {
      removed: true,
      added: true
    }
  },
  persist: {
    components: [Object3DComponent, PersistTagComponent],
    listen: {
      removed: true,
      added: true
    }
  }
}
