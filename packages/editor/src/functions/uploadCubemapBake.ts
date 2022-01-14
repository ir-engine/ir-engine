import { Mesh, MeshBasicMaterial } from 'three'
import { beforeMaterialCompile } from '@xrengine/engine/src/scene/classes/BPCEMShader'
import CubemapCapturer from '@xrengine/engine/src/scene/classes/CubemapCapturer'
import { convertCubemapToEquiImageData } from '@xrengine/engine/src/scene/classes/ImageUtils'
import { uploadProjectAsset } from './assetFunctions'
import { accessEditorState } from '../services/EditorServices'
import { Engine } from '@xrengine/engine/src/ecs/classes/Engine'
import { Entity } from '@xrengine/engine/src/ecs/classes/Entity'
import { getComponent } from '@xrengine/engine/src/ecs/functions/ComponentFunctions'
import { CubemapBakeComponent } from '@xrengine/engine/src/scene/components/CubemapBakeComponent'
import { prepareSceneForBake } from '@xrengine/engine/src/scene/functions/loaders/CubemapBakeFunctions'
import { NameComponent } from '@xrengine/engine/src/scene/components/NameComponent'
import { TransformComponent } from '@xrengine/engine/src/transform/components/TransformComponent'

export const uploadBakeToServer = async (entity: Entity, projectID: string, upload?: boolean) => {
  const bakeComponent = getComponent(entity, CubemapBakeComponent)
  const transformComponent = getComponent(entity, TransformComponent)

  const scene = prepareSceneForBake()
  const cubemapCapturer = new CubemapCapturer(Engine.renderer, scene, bakeComponent.options.resolution)
  const renderTarget = cubemapCapturer.update(transformComponent.position)

  // const imageData = (await convertCubemapToEquiImageData(Engine.renderer, result, 512, 512, false)).imageData
  // downloadImage(imageData, 'Hello', 512, 512)

  scene.traverse((child: Mesh<any, MeshBasicMaterial>) => {
    if (!child.material) return

    child.material.onBeforeCompile = beforeMaterialCompile(
      bakeComponent.options.bakeScale,
      bakeComponent.options.bakePositionOffset
    )
  })

  Engine.scene.environment = renderTarget.texture

  if (!upload) return

  const { blob } = await convertCubemapToEquiImageData(
    Engine.renderer,
    renderTarget,
    bakeComponent.options.resolution,
    bakeComponent.options.resolution,
    true
  )

  if (!blob) return

  const nameComponent = getComponent(entity, NameComponent)
  const sceneName = accessEditorState().sceneName.value
  const value = await uploadProjectAsset(projectID, [
    new File([blob], `${sceneName}-${nameComponent.name.replace(' ', '-')}.png`)
  ])

  bakeComponent.options.envMapOrigin = value[0].url
}
