import { Entity } from '../../ecs/classes/Entity'
import { getComponent } from '../../ecs/functions/ComponentFunctions'
import { ModelComponent } from '../../scene/components/ModelComponent'
import createGLTFExporter from './createGLTFExporter'

export default async function exportModelGLTF(
  entity: Entity,
  options = {
    path: '',
    binary: true,
    includeCustomExtensions: true,
    embedImages: true
  }
) {
  const scene = getComponent(entity, ModelComponent).scene.value!
  const exporter = await createGLTFExporter()
  const gltf: ArrayBuffer = await new Promise((resolve) =>
    exporter.parse(
      scene,
      (gltf: ArrayBuffer) => resolve(gltf),
      (error) => {
        throw error
      },
      options
    )
  )
  return gltf
}
