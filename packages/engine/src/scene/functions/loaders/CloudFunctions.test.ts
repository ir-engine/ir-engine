import assert from 'assert'
import proxyquire from 'proxyquire'
import { Color, Vector2, Vector3 } from 'three'

import { Entity } from '../../../ecs/classes/Entity'
import { getComponent, hasComponent, removeComponent } from '../../../ecs/functions/ComponentFunctions'
import { createEntity } from '../../../ecs/functions/EntityFunctions'
import { createEngine } from '../../../initializeEngine'
import { Clouds } from '../../classes/Clouds'
import {
  CloudComponent,
  CloudComponentType,
  SCENE_COMPONENT_CLOUD_DEFAULT_VALUES
} from '../../components/CloudComponent'
import { ErrorComponent } from '../../components/ErrorComponent'
import { Object3DComponent } from '../../components/Object3DComponent'
import { UpdatableComponent } from '../../components/UpdatableComponent'

describe('CloudFunctions', () => {
  let entity: Entity
  let cloudFunctions = proxyquire('./CloudFunctions', {
    '../../../common/functions/isClient': { isClient: true }
  })

  beforeEach(() => {
    createEngine()
    entity = createEntity()
  })

  const sceneComponentData = {
    texture: 'Some random path',
    worldScale: { x: Math.random(), y: Math.random(), z: Math.random() },
    dimensions: { x: Math.random(), y: Math.random(), z: Math.random() },
    noiseZoom: { x: Math.random(), y: Math.random(), z: Math.random() },
    noiseOffset: { x: Math.random(), y: Math.random(), z: Math.random() },
    spriteScaleRange: { x: Math.random(), y: Math.random() },
    fogColor: 0x456784,
    fogRange: { x: Math.random(), y: Math.random() }
  }

  describe('deserializeCloud()', () => {
    it('creates Cloud Component with provided component data', () => {
      cloudFunctions.deserializeCloud(entity, sceneComponentData)

      const cloudComponent = getComponent(entity, CloudComponent)
      assert(cloudComponent)
      assert(getComponent(entity, UpdatableComponent))
      assert(cloudComponent.texture === sceneComponentData.texture)
      assert(cloudComponent.fogColor.getHex() === sceneComponentData.fogColor)
      assert(
        cloudComponent.worldScale.equals(
          new Vector3(sceneComponentData.worldScale.x, sceneComponentData.worldScale.y, sceneComponentData.worldScale.z)
        )
      )
      assert(
        cloudComponent.dimensions.equals(
          new Vector3(sceneComponentData.dimensions.x, sceneComponentData.dimensions.y, sceneComponentData.dimensions.z)
        )
      )
      assert(
        cloudComponent.noiseZoom.equals(
          new Vector3(sceneComponentData.noiseZoom.x, sceneComponentData.noiseZoom.y, sceneComponentData.noiseZoom.z)
        )
      )
      assert(
        cloudComponent.noiseOffset.equals(
          new Vector3(
            sceneComponentData.noiseOffset.x,
            sceneComponentData.noiseOffset.y,
            sceneComponentData.noiseOffset.z
          )
        )
      )
      assert(
        cloudComponent.spriteScaleRange.equals(
          new Vector2(sceneComponentData.spriteScaleRange.x, sceneComponentData.spriteScaleRange.y)
        )
      )
      assert(cloudComponent.fogRange.equals(new Vector2(sceneComponentData.fogRange.x, sceneComponentData.fogRange.y)))
    })

    it('creates Cloud Object3D with provided component data', () => {
      cloudFunctions.deserializeCloud(entity, sceneComponentData)

      const obj3d = getComponent(entity, Object3DComponent)?.value
      assert(obj3d && obj3d instanceof Clouds, 'Cloud is not created')
    })
  })

  describe('serializeCloud()', () => {
    it('should properly serialize cloud', () => {
      cloudFunctions.deserializeCloud(entity, sceneComponentData)
      assert.deepEqual(JSON.parse(JSON.stringify(cloudFunctions.serializeCloud(entity))), sceneComponentData)
    })
  })

  describe('parseCloudProperties()', () => {
    it('should use default component values', () => {
      const componentData = cloudFunctions.parseCloudProperties({})
      assert(componentData.fogColor.getHex() === SCENE_COMPONENT_CLOUD_DEFAULT_VALUES.fogColor)
      assert(componentData.texture === SCENE_COMPONENT_CLOUD_DEFAULT_VALUES.texture)
      assert(
        componentData.worldScale.equals(
          new Vector3(
            SCENE_COMPONENT_CLOUD_DEFAULT_VALUES.worldScale.x,
            SCENE_COMPONENT_CLOUD_DEFAULT_VALUES.worldScale.y,
            SCENE_COMPONENT_CLOUD_DEFAULT_VALUES.worldScale.z
          )
        )
      )
      assert(
        componentData.dimensions.equals(
          new Vector3(
            SCENE_COMPONENT_CLOUD_DEFAULT_VALUES.dimensions.x,
            SCENE_COMPONENT_CLOUD_DEFAULT_VALUES.dimensions.y,
            SCENE_COMPONENT_CLOUD_DEFAULT_VALUES.dimensions.z
          )
        )
      )
      assert(
        componentData.noiseZoom.equals(
          new Vector3(
            SCENE_COMPONENT_CLOUD_DEFAULT_VALUES.noiseZoom.x,
            SCENE_COMPONENT_CLOUD_DEFAULT_VALUES.noiseZoom.y,
            SCENE_COMPONENT_CLOUD_DEFAULT_VALUES.noiseZoom.z
          )
        )
      )
      assert(
        componentData.noiseOffset.equals(
          new Vector3(
            SCENE_COMPONENT_CLOUD_DEFAULT_VALUES.noiseOffset.x,
            SCENE_COMPONENT_CLOUD_DEFAULT_VALUES.noiseOffset.y,
            SCENE_COMPONENT_CLOUD_DEFAULT_VALUES.noiseOffset.z
          )
        )
      )
      assert(
        componentData.spriteScaleRange.equals(
          new Vector2(
            SCENE_COMPONENT_CLOUD_DEFAULT_VALUES.spriteScaleRange.x,
            SCENE_COMPONENT_CLOUD_DEFAULT_VALUES.spriteScaleRange.y
          )
        )
      )
      assert(
        componentData.fogRange.equals(
          new Vector2(SCENE_COMPONENT_CLOUD_DEFAULT_VALUES.fogRange.x, SCENE_COMPONENT_CLOUD_DEFAULT_VALUES.fogRange.y)
        )
      )
    })

    it('should use passed values', () => {
      const componentData = cloudFunctions.parseCloudProperties({ ...sceneComponentData })
      assert(componentData.fogColor.getHex() === sceneComponentData.fogColor)
      assert(componentData.texture === sceneComponentData.texture)
      assert(
        componentData.worldScale.equals(
          new Vector3(sceneComponentData.worldScale.x, sceneComponentData.worldScale.y, sceneComponentData.worldScale.z)
        )
      )
      assert(
        componentData.dimensions.equals(
          new Vector3(sceneComponentData.dimensions.x, sceneComponentData.dimensions.y, sceneComponentData.dimensions.z)
        )
      )
      assert(
        componentData.noiseZoom.equals(
          new Vector3(sceneComponentData.noiseZoom.x, sceneComponentData.noiseZoom.y, sceneComponentData.noiseZoom.z)
        )
      )
      assert(
        componentData.noiseOffset.equals(
          new Vector3(
            sceneComponentData.noiseOffset.x,
            sceneComponentData.noiseOffset.y,
            sceneComponentData.noiseOffset.z
          )
        )
      )
      assert(
        componentData.spriteScaleRange.equals(
          new Vector2(sceneComponentData.spriteScaleRange.x, sceneComponentData.spriteScaleRange.y)
        )
      )
      assert(componentData.fogRange.equals(new Vector2(sceneComponentData.fogRange.x, sceneComponentData.fogRange.y)))
    })
  })
})
