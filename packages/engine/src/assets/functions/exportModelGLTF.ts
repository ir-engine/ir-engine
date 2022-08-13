import { Entity } from '../../ecs/classes/Entity'
import { getComponent } from '../../ecs/functions/ComponentFunctions'
import { ModelComponent } from '../../scene/components/ModelComponent'
import { Object3DComponent } from '../../scene/components/Object3DComponent'
import createGLTFExporter from './createGLTFExporter'

export default async function exportModelGLTF(
  entity: Entity,
  options = {
    binary: true,
    includeCustomExtensions: true,
    embedImages: true
  }
) {
  const obj3d = getComponent(entity, Object3DComponent).value
  const exporter = await createGLTFExporter()
  const gltf: ArrayBuffer = await new Promise((resolve) =>
    exporter.parse(
      obj3d,
      (gltf: ArrayBuffer) => resolve(gltf),
      (error) => {
        throw error
      },
      options
    )
  )
  return gltf
}
