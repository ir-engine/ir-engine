import { Color } from 'three'

import { Engine } from '../../ecs/classes/Engine'
import { World } from '../../ecs/classes/World'
import { defineQuery, getComponent } from '../../ecs/functions/ComponentFunctions'
import { configureEffectComposer } from '../../renderer/functions/configureEffectComposer'
import { EngineRenderer } from '../../renderer/WebGLRendererSystem'
import { DirectionalLightComponent } from '../components/DirectionalLightComponent'
import { FogComponent } from '../components/FogComponent'
import { Object3DComponent } from '../components/Object3DComponent'
import { PostprocessingComponent } from '../components/PostprocessingComponent'
import { SkyboxComponent } from '../components/SkyboxComponent'
import { FogType } from '../constants/FogType'
import { createFogFromSceneNode } from '../functions/loaders/FogFunctions'

export default async function EntityNodeEventSystem(_: World) {
  const skyboxQuery = defineQuery([SkyboxComponent])
  const fogQuery = defineQuery([FogComponent])
  const postProcessingQuery = defineQuery([PostprocessingComponent])
  const directionalLightQuery = defineQuery([DirectionalLightComponent, Object3DComponent])

  return () => {
    /* Remove Events */
    for (const _ of skyboxQuery.exit()) {
      Engine.instance.currentWorld.scene.background = new Color('black')
    }

    for (const entity of fogQuery.enter()) {
      if (entity === Engine.instance.currentWorld.entityTree.rootNode.entity) {
        createFogFromSceneNode(entity)
      }
    }

    for (const entity of fogQuery.exit()) {
      if (entity !== Engine.instance.currentWorld.entityTree.rootNode.entity) {
        Engine.instance.currentWorld.scene.fog = null
      }
    }

    if (Engine.instance.isEditor) {
      for (const _ of postProcessingQuery.exit()) {
        configureEffectComposer(true)
      }

      for (const _ of postProcessingQuery.enter()) {
        configureEffectComposer()
      }
    }

    for (const entity of directionalLightQuery.enter()) {
      const lightComponent = getComponent(entity, DirectionalLightComponent)

      if (lightComponent.useInCSM && EngineRenderer.instance.csm) {
        const obj3d = getComponent(entity, Object3DComponent).value
        if (obj3d) obj3d.getWorldDirection(EngineRenderer.instance.csm.lightDirection)
      }
    }

    for (const entity of fogQuery()) {
      const fog = getComponent(entity, FogComponent)
      if (fog.type === FogType.Brownian) {
        fog.shaders?.forEach(
          (shader) => (shader.uniforms.fogTime.value = Engine.instance.currentWorld.fixedElapsedSeconds)
        )
      }
    }
  }
}
