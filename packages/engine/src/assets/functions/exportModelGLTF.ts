import { Matrix4 } from 'three'

import { Entity } from '../../ecs/classes/Entity'
import { getComponent } from '../../ecs/functions/ComponentFunctions'
import { ModelComponent } from '../../scene/components/ModelComponent'
import { LocalTransformComponent, TransformComponent } from '../../transform/components/TransformComponent'
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
  const gltf: ArrayBuffer = await new Promise((resolve) => {
    const rootMatrix = scene.matrix.clone()
    const inverseRoot = rootMatrix.clone().invert()
    scene.children.map((child) => child.applyMatrix4(inverseRoot))
    exporter.parse(
      scene,
      (gltf: ArrayBuffer) => {
        scene.children.map((child) => child.applyMatrix4(rootMatrix))
        resolve(gltf)
      },
      (error) => {
        throw error
      },
      options
    )
  })
  return gltf
}
