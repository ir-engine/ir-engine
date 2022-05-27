import assert from 'assert'
import { Color, DirectionalLight, Scene, Vector2 } from 'three'

import { ComponentJson } from '@xrengine/common/src/interfaces/SceneInterface'

import { Engine } from '../../../ecs/classes/Engine'
import { getComponent, hasComponent } from '../../../ecs/functions/ComponentFunctions'
import { createEntity } from '../../../ecs/functions/EntityFunctions'
import { createEngine } from '../../../initializeEngine'
import { EngineRenderer } from '../../../renderer/WebGLRendererSystem'
import { Object3DComponent } from '../../components/Object3DComponent'
import { deserializeDirectionalLight } from './DirectionalLightFunctions'

describe('DirectionalLightFunctions', () => {
  describe('deserializeDirectionalLight', async () => {
    it('with CSM', () => {
      createEngine()
      EngineRenderer.instance.isCSMEnabled = true
      EngineRenderer.instance.directionalLightEntities = []

      const entity = createEntity()

      const color = new Color('green')
      const sceneComponentData = {
        color: color.clone(),
        intensity: 5,
        castShadow: true,
        shadowMapResolution: [32, 32],
        shadowBias: 0.1,
        shadowRadius: 10,
        cameraFar: 123,
        useInCSM: true
      }
      const sceneComponent: ComponentJson = {
        name: 'directional-light',
        props: sceneComponentData
      }

      deserializeDirectionalLight(entity, sceneComponent)

      const activeCSMLightEntity = EngineRenderer.instance.directionalLightEntities[0]
      const light = getComponent(activeCSMLightEntity, Object3DComponent)?.value as DirectionalLight

      assert(light)
      assert(light.color instanceof Color)
      assert.deepEqual(light.color.toArray(), color.toArray())
      assert.deepEqual(light.intensity, 5)
      assert.deepEqual(light.shadow.mapSize, new Vector2(32, 32))
      assert.deepEqual(light.shadow.bias, 0.1)
      assert.deepEqual(light.shadow.radius, 10)
      assert.deepEqual(light.shadow.camera.far, 123)
      assert.deepEqual(light.castShadow, false)
    })

    it('without CSM', () => {
      createEngine()
      const world = Engine.instance.currentWorld
      EngineRenderer.instance.isCSMEnabled = false

      const entity = createEntity()

      const color = new Color('green')
      const sceneComponentData = {
        color: color.clone(),
        intensity: 6,
        castShadow: true,
        shadowMapResolution: [64, 64],
        shadowBias: 0.01,
        shadowRadius: 20,
        cameraFar: 256
      }
      const sceneComponent: ComponentJson = {
        name: 'directional-light',
        props: sceneComponentData
      }

      deserializeDirectionalLight(entity, sceneComponent)

      assert(hasComponent(entity, Object3DComponent))
      assert(getComponent(entity, Object3DComponent).value instanceof DirectionalLight)
      assert((getComponent(entity, Object3DComponent).value as DirectionalLight).color instanceof Color)
      assert.deepEqual(
        (getComponent(entity, Object3DComponent).value as DirectionalLight).color.toArray(),
        color.toArray()
      )
      assert.deepEqual((getComponent(entity, Object3DComponent).value as DirectionalLight).intensity, 6)
      assert.deepEqual(
        (getComponent(entity, Object3DComponent).value as DirectionalLight).shadow.mapSize,
        new Vector2(64, 64)
      )
      assert.deepEqual((getComponent(entity, Object3DComponent).value as DirectionalLight).shadow.bias, 0.01)
      assert.deepEqual((getComponent(entity, Object3DComponent).value as DirectionalLight).shadow.radius, 20)
      assert.deepEqual((getComponent(entity, Object3DComponent).value as DirectionalLight).shadow.camera.far, 256)
      assert.deepEqual((getComponent(entity, Object3DComponent).value as DirectionalLight).castShadow, true)
    })
  })
})
