import { Color, DirectionalLight } from 'three'

import { AudioComponent } from '../../audio/components/AudioComponent'
import { Engine } from '../../ecs/classes/Engine'
import { World } from '../../ecs/classes/World'
import { defineQuery, getComponent } from '../../ecs/functions/ComponentFunctions'
import { configureEffectComposer } from '../../renderer/functions/configureEffectComposer'
import { EngineRenderer } from '../../renderer/WebGLRendererSystem'
import { DirectionalLightComponent } from '../components/DirectionalLightComponent'
import { FogComponent } from '../components/FogComponent'
import { Object3DComponent } from '../components/Object3DComponent'
import { PostprocessingComponent } from '../components/PostprocessingComponent'
import { ScenePreviewCameraTagComponent } from '../components/ScenePreviewCamera'
import { SelectTagComponent } from '../components/SelectTagComponent'
import { SkyboxComponent } from '../components/SkyboxComponent'
import { VideoComponent } from '../components/VideoComponent'
import { VolumetricComponent } from '../components/VolumetricComponent'
import { SCENE_PREVIEW_CAMERA_HELPER } from '../functions/loaders/ScenePreviewCameraFunctions'

/**
 * @author Nayankumar Patel <github.com/NPatel10>
 */
export default async function EntityNodeEventSystem(_: World) {
  const skyboxQuery = defineQuery([SkyboxComponent])
  const fogQuery = defineQuery([FogComponent])
  const postProcessingQuery = defineQuery([PostprocessingComponent])
  const scenePreviewCameraQuery = defineQuery([ScenePreviewCameraTagComponent])
  const videoQuery = defineQuery([VideoComponent])
  const videoAudioQuery = defineQuery([VideoComponent, AudioComponent])
  const volumetricAudioQuery = defineQuery([VolumetricComponent, AudioComponent])

  const directionalLightQuery = defineQuery([DirectionalLightComponent])
  const directionalLightSelectQuery = defineQuery([DirectionalLightComponent, SelectTagComponent])
  const scenePreviewCameraSelectQuery = defineQuery([ScenePreviewCameraTagComponent, SelectTagComponent])

  return () => {
    /* Select Events */
    for (const entity of directionalLightSelectQuery.enter()) {
      const component = getComponent(entity, DirectionalLightComponent)
      const light = getComponent(entity, Object3DComponent)?.value as DirectionalLight
      if (light) light.userData.cameraHelper.visible = component.showCameraHelper
    }

    for (let entity of scenePreviewCameraSelectQuery.enter()) {
      const obj3d = getComponent(entity, Object3DComponent).value
      Engine.instance.currentWorld.scene.add(obj3d.userData.helper)
      obj3d.userData.helper.update()
    }

    /* Deselect Events */
    for (const entity of directionalLightSelectQuery.exit()) {
      const light = getComponent(entity, Object3DComponent)?.value as DirectionalLight
      if (light) light.userData.cameraHelper.visible = false
    }

    for (let entity of scenePreviewCameraSelectQuery.exit()) {
      let obj3d = getComponent(entity, Object3DComponent)?.value

      if (obj3d) {
        Engine.instance.currentWorld.scene.remove(obj3d.userData.helper)
      } else {
        const obj3d = Engine.instance.currentWorld.scene.getObjectByName(SCENE_PREVIEW_CAMERA_HELPER)
        if (obj3d) Engine.instance.currentWorld.scene.remove(obj3d)
      }
    }

    /* Remove Events */
    for (const _ of skyboxQuery.exit()) {
      Engine.instance.currentWorld.scene.background = new Color('black')
    }

    for (const _ of fogQuery.exit()) {
      Engine.instance.currentWorld.scene.fog = null
    }

    if (Engine.instance.isEditor) {
      for (const _ of postProcessingQuery.exit()) {
        configureEffectComposer(true)
      }

      for (const _ of postProcessingQuery.enter()) {
        configureEffectComposer()
      }
    }

    for (const _ of scenePreviewCameraQuery.exit()) {
      const obj3d = Engine.instance.currentWorld.scene.getObjectByName(SCENE_PREVIEW_CAMERA_HELPER)
      if (obj3d) Engine.instance.currentWorld.scene.remove(obj3d)
    }

    for (const entity of videoQuery.exit()) {
      const videoComponent = getComponent(entity, VideoComponent, true)
      document.getElementById(videoComponent.elementId)?.remove()
    }

    /* Misc */
    for (const entity of videoAudioQuery.enter()) {
      const obj3d = getComponent(entity, Object3DComponent).value
      obj3d.userData.textureMesh?.removeFromParent()
    }

    for (const entity of volumetricAudioQuery.enter()) {
      const obj3d = getComponent(entity, Object3DComponent).value
      obj3d.userData.textureMesh?.removeFromParent()
    }

    for (const entity of directionalLightQuery.enter()) {
      const lightComponent = getComponent(entity, DirectionalLightComponent)

      if (lightComponent.useInCSM && EngineRenderer.instance.csm) {
        const obj3d = getComponent(entity, Object3DComponent).value
        if (obj3d) obj3d.getWorldDirection(EngineRenderer.instance.csm.lightDirection)
      }
    }
  }
}
