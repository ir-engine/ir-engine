import { Material, Mesh, MeshBasicMaterial, MeshPhongMaterial, MeshStandardMaterial } from 'three'
import { Engine } from '../../ecs/classes/Engine'
import { beforeMaterialCompile } from '../classes/BPCEMShader'
import { SceneOptions } from '../systems/SceneObjectSystem'

export const useSimpleMaterial = (obj: Mesh): void => {
  if (obj.material instanceof MeshStandardMaterial) {
    ;(obj as any).prevMaterial = obj.material
    obj.material = new MeshPhongMaterial()
    MeshBasicMaterial.prototype.copy.call(obj.material, (obj as any).prevMaterial)
  }
}

export const useStandardMaterial = (obj: Mesh): void => {
  const material = (obj as any).prevMaterial ?? obj.material

  if (typeof material === 'undefined') return

  // BPCEM
  if (SceneOptions.instance.boxProjection) {
    material.onBeforeCompile = beforeMaterialCompile(
      SceneOptions.instance.bpcemOptions.bakeScale,
      SceneOptions.instance.bpcemOptions.bakePositionOffset
    )
  }

  ;(material as any).envMapIntensity = SceneOptions.instance.envMapIntensity

  if ((obj as any).prevMaterial) {
    ;(obj.material as Material).dispose()
    obj.material = material
    ;(obj as any).prevMaterial = undefined
  }

  if (obj.receiveShadow) Engine.csm?.setupMaterial(obj)
}
