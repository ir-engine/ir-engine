import { Color, DirectionalLight } from 'three'
import { Engine } from '../../ecs/classes/Engine'
import { System } from '../../ecs/classes/System'
import { World } from '../../ecs/classes/World'
import { defineQuery, getComponent } from '../../ecs/functions/ComponentFunctions'
import { configureEffectComposer } from '../../renderer/functions/configureEffectComposer'
import { DirectionalLightComponent } from '../components/DirectionalLightComponent'
import { FogComponent } from '../components/FogComponent'
import { Object3DComponent } from '../components/Object3DComponent'
import { PostprocessingComponent } from '../components/PostprocessingComponent'
import { RenderSettingComponent } from '../components/RenderSettingComponent'
import { ScenePreviewCameraTagComponent } from '../components/ScenePreviewCamera'
import { SelectTagComponent } from '../components/SelectTagComponent'
import { SkyboxComponent } from '../components/SkyboxComponent'
import { resetEngineRenderer } from '../functions/RenderSettingsFunction'

/**
 * @author Nayankumar Patel <github.com/NPatel10>
 */
export default async function EntityNodeEventSystem(_: World): Promise<System> {
  const skyboxQuery = defineQuery([SkyboxComponent])
  const fogQuery = defineQuery([FogComponent])
  const renderSettingQuery = defineQuery([RenderSettingComponent])
  const postProcessingQuery = defineQuery([PostprocessingComponent])

  const directionalLightSelectQuery = defineQuery([DirectionalLightComponent, SelectTagComponent])
  const scenePreviewCameraSelectQuery = defineQuery([ScenePreviewCameraTagComponent, SelectTagComponent])

  return () => {
    /* Select Events */
    for (const entity of directionalLightSelectQuery.enter()) {
      const component = getComponent(entity, DirectionalLightComponent)
      const light = getComponent(entity, Object3DComponent)?.value as DirectionalLight
      light.userData.cameraHelper.visible = component.showCameraHelper
    }

    for (let entity of scenePreviewCameraSelectQuery.enter()) {
      const obj3d = getComponent(entity, Object3DComponent).value
      Engine.scene.add(obj3d.userData.helper)
      obj3d.userData.helper.update()
    }

    /* Deselect Events */
    for (const entity of directionalLightSelectQuery.exit()) {
      const light = getComponent(entity, Object3DComponent)?.value as DirectionalLight
      light.userData.cameraHelper.visible = false
    }

    for (let entity of scenePreviewCameraSelectQuery.exit()) {
      const obj3d = getComponent(entity, Object3DComponent).value
      Engine.scene.remove(obj3d.userData.helper)
    }

    /* Remove Events */
    for (const _ of skyboxQuery.exit()) {
      Engine.scene.background = new Color('black')
    }

    for (const _ of fogQuery.exit()) {
      Engine.scene.fog = null
    }

    for (const _ of renderSettingQuery.exit()) {
      resetEngineRenderer()
    }

    for (const _ of postProcessingQuery.exit()) {
      configureEffectComposer(true)
    }
  }
}
