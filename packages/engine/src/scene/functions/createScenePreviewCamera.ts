import { CameraHelper, PerspectiveCamera } from 'three'
import { isClient } from '../../common/functions/isClient'
import { Engine } from '../../ecs/classes/Engine'
import { Entity } from '../../ecs/classes/Entity'
import { addComponent } from '../../ecs/functions/ComponentFunctions'
import { CopyTransformComponent } from '../../transform/components/CopyTransformComponent'
import { Object3DComponent } from '../components/Object3DComponent'
import { ScenePreviewCameraTagComponent } from '../components/ScenePreviewCamera'
import { ScenePropertyType, SceneDataComponent } from '../functions/SceneLoading'

export const createScenePreviewCamera = (entity: Entity, component: SceneDataComponent, _: ScenePropertyType) => {
  if (!isClient || !component) return

  addComponent(entity, ScenePreviewCameraTagComponent, {})
  if (Engine.isEditor) {
    const camera = new PerspectiveCamera(80, 16 / 9, 0.2, 8000)
    camera.userData.helper = new CameraHelper(camera)
    camera.userData.helper.layers.set(1)

    addComponent(entity, Object3DComponent, { value: camera })
  } else if (Engine.activeCameraEntity) {
    addComponent(Engine.activeCameraEntity, CopyTransformComponent, { input: entity })
  }
}
