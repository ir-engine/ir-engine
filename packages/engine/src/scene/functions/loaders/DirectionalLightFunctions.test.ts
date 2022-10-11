import assert from 'assert'
import { Color, DirectionalLight, Scene, Vector2 } from 'three'

import { Engine } from '../../../ecs/classes/Engine'
import { getComponent, hasComponent } from '../../../ecs/functions/ComponentFunctions'
import { createEntity } from '../../../ecs/functions/EntityFunctions'
import { addEntityNodeChild, createEntityNode } from '../../../ecs/functions/EntityTree'
import { createEngine } from '../../../initializeEngine'
import { EngineRenderer } from '../../../renderer/WebGLRendererSystem'
import { DirectionalLightComponent } from '../../components/DirectionalLightComponent'
import { deserializeDirectionalLight, updateDirectionalLight } from './DirectionalLightFunctions'

describe('DirectionalLightFunctions', () => {
  describe('deserializeDirectionalLight', async () => {
    it('with CSM', () => {
      createEngine()
      EngineRenderer.instance.csm = null!
      const entity = createEntity()
      const node = createEntityNode(entity)
      const world = Engine.instance.currentWorld
      addEntityNodeChild(node, world.entityTree.rootNode)

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

      deserializeDirectionalLight(entity, sceneComponentData)
      updateDirectionalLight(entity)

      const light = getComponent(entity, DirectionalLightComponent).light

      assert(light)
      assert(light.color instanceof Color)
      assert.deepEqual(light.color.toArray(), color.toArray())
      assert.deepEqual(light.intensity, 5)
      assert.deepEqual(light.shadow.mapSize, new Vector2(32, 32))
      assert.deepEqual(light.shadow.bias, 0.1)
      assert.deepEqual(light.shadow.radius, 10)
      assert.deepEqual(light.shadow.camera.far, 123)
      assert.deepEqual(light.castShadow, true)
    })

    it('without CSM', () => {
      createEngine()
      const world = Engine.instance.currentWorld
      EngineRenderer.instance.csm = null!

      const entity = createEntity()
      const node = createEntityNode(entity)
      addEntityNodeChild(node, world.entityTree.rootNode)

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

      deserializeDirectionalLight(entity, sceneComponentData)
      updateDirectionalLight(entity)

      assert(hasComponent(entity, DirectionalLightComponent))
      assert(getComponent(entity, DirectionalLightComponent).light instanceof DirectionalLight)
      assert(getComponent(entity, DirectionalLightComponent).light.color instanceof Color)
      assert.deepEqual(getComponent(entity, DirectionalLightComponent).light.color.toArray(), color.toArray())
      assert.deepEqual(getComponent(entity, DirectionalLightComponent).light.intensity, 6)
      assert.deepEqual(getComponent(entity, DirectionalLightComponent).light.shadow.mapSize, new Vector2(64, 64))
      assert.deepEqual(getComponent(entity, DirectionalLightComponent).light.shadow.bias, 0.01)
      assert.deepEqual(getComponent(entity, DirectionalLightComponent).light.shadow.radius, 20)
      assert.deepEqual(getComponent(entity, DirectionalLightComponent).light.shadow.camera.far, 256)
      assert.deepEqual(getComponent(entity, DirectionalLightComponent).light.castShadow, true)
    })
  })
})
