import assert from 'assert'
import { ComponentJson } from "@xrengine/common/src/interfaces/SceneInterface"
import { Color, DirectionalLight } from "three"
import { createEntity } from "../../../ecs/functions/EntityFunctions"
import { createWorld } from "../../../ecs/classes/World"
import { Engine } from "../../../ecs/classes/Engine"
import { deserializeDirectionalLight } from './DirectionalLightFunctions'
import { getComponent, hasComponent } from '../../../ecs/functions/ComponentFunctions'
import { Object3DComponent } from '../../components/Object3DComponent'

describe('DirectionalLightFunctions', () => {
  describe('deserializeDirectionalLight', async () => {

    // reset globals
    afterEach(() => {
      Engine.directionalLights = []
    })

    it('with CSM', () => {
      const world = createWorld()
      Engine.currentWorld = world
      Engine.isCSMEnabled = true
      Engine.directionalLights = []

      const entity = createEntity()

      const color = new Color('green')
      const sceneComponentData = {
        color: color.clone(),
        intensity: 5,
        castShadow: true,
        shadowMapResolution: [32, 32],
        shadowBias: 0.1,
        shadowRadius: 10,
        cameraFar: 123
      }
      const sceneComponent: ComponentJson = {
        name: 'directional-light',
        props: sceneComponentData
      }

      deserializeDirectionalLight(entity, sceneComponent)

      const light = Engine.directionalLights[0]

      assert(!hasComponent(entity, Object3DComponent))
      assert(light)
      assert(light.color instanceof Color)
      assert.deepEqual(light.color.toArray(), color.toArray())
      assert.deepEqual(light.intensity, 5)
      assert.deepEqual(light.shadow.mapSize, { x: 32, y: 32 })
      assert.deepEqual(light.shadow.bias, 0.1)
      assert.deepEqual(light.shadow.radius, 10)
      assert.deepEqual(light.shadow.camera.far, 123)
      assert.deepEqual(light.castShadow, true)

    })


    it('without CSM', () => {
      const world = createWorld()
      Engine.currentWorld = world
      Engine.isCSMEnabled = false

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
      assert.deepEqual((getComponent(entity, Object3DComponent).value as DirectionalLight).color.toArray(), color.toArray())
      assert.deepEqual((getComponent(entity, Object3DComponent).value as DirectionalLight).intensity, 6)
      assert.deepEqual((getComponent(entity, Object3DComponent).value as DirectionalLight).shadow.mapSize, { x: 64, y: 64 })
      assert.deepEqual((getComponent(entity, Object3DComponent).value as DirectionalLight).shadow.bias, 0.01)
      assert.deepEqual((getComponent(entity, Object3DComponent).value as DirectionalLight).shadow.radius, 20)
      assert.deepEqual((getComponent(entity, Object3DComponent).value as DirectionalLight).shadow.camera.far, 256)
      assert.deepEqual((getComponent(entity, Object3DComponent).value as DirectionalLight).castShadow, true)

    })

  })
})