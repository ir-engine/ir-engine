import assert from 'assert'
import proxyquire from 'proxyquire'
import { Color, Vector2, Vector3 } from 'three'

import { ComponentJson } from '@xrengine/common/src/interfaces/SceneInterface'

import { Engine } from '../../../ecs/classes/Engine'
import { Entity } from '../../../ecs/classes/Entity'
import { getComponent, hasComponent, removeComponent } from '../../../ecs/functions/ComponentFunctions'
import { addComponent } from '../../../ecs/functions/ComponentFunctions'
import { createEntity } from '../../../ecs/functions/EntityFunctions'
import { createEngine } from '../../../initializeEngine'
import { Clouds } from '../../classes/Clouds'
import { CloudComponent, CloudComponentType } from '../../components/CloudComponent'
import { EntityNodeComponent } from '../../components/EntityNodeComponent'
import { ErrorComponent } from '../../components/ErrorComponent'
import { Object3DComponent } from '../../components/Object3DComponent'
import { UpdatableComponent } from '../../components/UpdatableComponent'
import { SCENE_COMPONENT_CLOUD, SCENE_COMPONENT_CLOUD_DEFAULT_VALUES } from './CloudFunctions'

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

  const sceneComponent: ComponentJson = {
    name: SCENE_COMPONENT_CLOUD,
    props: sceneComponentData
  }

  describe('deserializeCloud()', () => {
    it('does not create Cloud Component while not on client side', () => {
      const _cloudFunctions = proxyquire('./CloudFunctions', {
        '../../../common/functions/isClient': { isClient: false }
      })
      _cloudFunctions.deserializeCloud(entity, sceneComponent)

      const cloudComponent = getComponent(entity, CloudComponent)
      assert(!cloudComponent)
    })

    it('creates Cloud Component with provided component data', () => {
      cloudFunctions.deserializeCloud(entity, sceneComponent)

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
      cloudFunctions.deserializeCloud(entity, sceneComponent)

      const obj3d = getComponent(entity, Object3DComponent)?.value
      assert(obj3d && obj3d instanceof Clouds, 'Cloud is not created')
      assert(obj3d.userData.disableOutline, 'Cloud outline is not disabled')
    })

    it('will include this component into EntityNodeComponent', () => {
      addComponent(entity, EntityNodeComponent, { components: [] })

      cloudFunctions.deserializeCloud(entity, sceneComponent)

      const entityNodeComponent = getComponent(entity, EntityNodeComponent)
      assert(entityNodeComponent.components.includes(SCENE_COMPONENT_CLOUD))
    })
  })

  describe('updateCloud()', () => {
    let cloudComponent: CloudComponentType
    let obj3d: Clouds

    beforeEach(() => {
      cloudFunctions.deserializeCloud(entity, sceneComponent)
      cloudComponent = getComponent(entity, CloudComponent) as CloudComponentType
      obj3d = getComponent(entity, Object3DComponent)?.value as Clouds
    })

    describe('Property tests for "texture"', () => {
      it('should not update property', () => {
        cloudFunctions.updateCloud(entity, {})

        assert.equal(cloudComponent.texture, sceneComponentData.texture)
        assert.equal(obj3d.texture, sceneComponentData.texture)
        assert(hasComponent(entity, ErrorComponent))
      })

      it('should update property', () => {
        removeComponent(entity, ErrorComponent)

        const newTexture = 'https://mysite.com/image.png'
        cloudComponent.texture = newTexture
        cloudFunctions.updateCloud(entity, { texture: newTexture })

        assert.equal(obj3d.texture, newTexture)

        cloudFunctions.updateCloud(entity, { texture: 'https://fakesite2.com/image10.png' })
        assert.equal(obj3d.texture, newTexture, 'should not update property to passed value')

        assert(!hasComponent(entity, ErrorComponent))
      })

      // TODO:  error is thrown async in Clouds.ts texture setter and cant be detected here
      // it('sets error component in entity', async () => {
      //   const newTexture = 'New path'
      //   cloudComponent.texture = newTexture
      //   const _cloudFunctions = proxyquire('./CloudFunctions', {})
      //   _cloudFunctions.deserializeCloud(entity, sceneComponent)
      //   _cloudFunctions.updateCloud(entity, { texture: newTexture })

      //   assert.equal(cloudComponent.texture, newTexture)
      //   assert.equal(obj3d.texture, sceneComponentData.texture)
      //   assert(hasComponent(entity, ErrorComponent))
      // })
    })

    describe('Property tests for "worldScale"', () => {
      it('should not update property', () => {
        cloudFunctions.updateCloud(entity, {})

        const vec = new Vector3(
          sceneComponentData.worldScale.x,
          sceneComponentData.worldScale.y,
          sceneComponentData.worldScale.z
        )
        assert(cloudComponent.worldScale.equals(vec))
        assert(obj3d.worldScale.equals(vec))
      })

      it('should update property', () => {
        const newWorldScale = new Vector3(Math.random(), Math.random(), Math.random())
        cloudComponent.worldScale = newWorldScale
        cloudFunctions.updateCloud(entity, { worldScale: newWorldScale })

        assert(obj3d.worldScale.equals(newWorldScale))

        cloudFunctions.updateCloud(entity, { worldScale: new Vector3(Math.random(), Math.random(), Math.random()) })
        assert(obj3d.worldScale.equals(newWorldScale), 'should not update property to passed value')
      })
    })

    describe('Property tests for "dimensions"', () => {
      it('should not update property', () => {
        cloudFunctions.updateCloud(entity, {})

        const vec = new Vector3(
          sceneComponentData.dimensions.x,
          sceneComponentData.dimensions.y,
          sceneComponentData.dimensions.z
        )
        assert(cloudComponent.dimensions.equals(vec))
        assert(obj3d.dimensions.equals(vec))
      })

      it('should update property', () => {
        const newDimensions = new Vector3(Math.random(), Math.random(), Math.random())
        cloudComponent.dimensions = newDimensions
        cloudFunctions.updateCloud(entity, { dimensions: newDimensions })

        assert(obj3d.dimensions.equals(newDimensions))

        cloudFunctions.updateCloud(entity, { dimensions: new Vector3(Math.random(), Math.random(), Math.random()) })
        assert(obj3d.dimensions.equals(newDimensions), 'should not update property to passed value')
      })
    })

    describe('Property tests for "noiseZoom"', () => {
      it('should not update property', () => {
        cloudFunctions.updateCloud(entity, {})

        const vec = new Vector3(
          sceneComponentData.noiseZoom.x,
          sceneComponentData.noiseZoom.y,
          sceneComponentData.noiseZoom.z
        )
        assert(cloudComponent.noiseZoom.equals(vec))
        assert(obj3d.noiseZoom.equals(vec))
      })

      it('should update property', () => {
        const newNoiseZoom = new Vector3(Math.random(), Math.random(), Math.random())
        cloudComponent.noiseZoom = newNoiseZoom
        cloudFunctions.updateCloud(entity, { noiseZoom: newNoiseZoom })

        assert(obj3d.noiseZoom.equals(newNoiseZoom))

        cloudFunctions.updateCloud(entity, { noiseZoom: new Vector3(Math.random(), Math.random(), Math.random()) })
        assert(obj3d.noiseZoom.equals(newNoiseZoom), 'should not update property to passed value')
      })
    })

    describe('Property tests for "noiseOffset"', () => {
      it('should not update property', () => {
        cloudFunctions.updateCloud(entity, {})

        const vec = new Vector3(
          sceneComponentData.noiseOffset.x,
          sceneComponentData.noiseOffset.y,
          sceneComponentData.noiseOffset.z
        )
        assert(cloudComponent.noiseOffset.equals(vec))
        assert(obj3d.noiseOffset.equals(vec))
      })

      it('should update property', () => {
        const newNoiseOffset = new Vector3(Math.random(), Math.random(), Math.random())
        cloudComponent.noiseOffset = newNoiseOffset
        cloudFunctions.updateCloud(entity, { noiseOffset: newNoiseOffset })

        assert(obj3d.noiseOffset.equals(newNoiseOffset))

        cloudFunctions.updateCloud(entity, { noiseOffset: new Vector3(Math.random(), Math.random(), Math.random()) })
        assert(obj3d.noiseOffset.equals(newNoiseOffset), 'should not update property to passed value')
      })
    })

    describe('Property tests for "spriteScaleRange"', () => {
      it('should not update property', () => {
        cloudFunctions.updateCloud(entity, {})

        const vec = new Vector2(sceneComponentData.spriteScaleRange.x, sceneComponentData.spriteScaleRange.y)
        assert(cloudComponent.spriteScaleRange.equals(vec))
        assert(obj3d.spriteScaleRange.equals(vec))
      })

      it('should update property', () => {
        const newSpriteScaleRange = new Vector2(Math.random(), Math.random())
        cloudComponent.spriteScaleRange = newSpriteScaleRange
        cloudFunctions.updateCloud(entity, { spriteScaleRange: newSpriteScaleRange })

        assert(obj3d.spriteScaleRange.equals(newSpriteScaleRange))

        cloudFunctions.updateCloud(entity, { spriteScaleRange: new Vector2(Math.random(), Math.random()) })
        assert(obj3d.spriteScaleRange.equals(newSpriteScaleRange), 'should not update property to passed value')
      })
    })

    describe('Property tests for "fogRange"', () => {
      it('should not update property', () => {
        cloudFunctions.updateCloud(entity, {})

        const vec = new Vector2(sceneComponentData.fogRange.x, sceneComponentData.fogRange.y)
        assert(cloudComponent.fogRange.equals(vec))
        assert(obj3d.fogRange.equals(vec))
      })

      it('should update property', () => {
        const newFogRange = new Vector2(Math.random(), Math.random())
        cloudComponent.fogRange = newFogRange
        cloudFunctions.updateCloud(entity, { fogRange: newFogRange })

        assert(obj3d.fogRange.equals(newFogRange))

        cloudFunctions.updateCloud(entity, { fogRange: new Vector2(Math.random(), Math.random()) })
        assert(obj3d.fogRange.equals(newFogRange), 'should not update property to passed value')
      })
    })

    describe('Property tests for "fogColor"', () => {
      it('should not update property', () => {
        cloudFunctions.updateCloud(entity, {})

        assert(cloudComponent.fogColor.getHex() === sceneComponentData.fogColor)
        assert(obj3d.fogColor.getHex() === sceneComponentData.fogColor)
      })

      it('should update property', () => {
        const newFogColor = new Color('brown')
        cloudComponent.fogColor = newFogColor
        cloudFunctions.updateCloud(entity, { fogColor: newFogColor })

        assert(obj3d.fogColor.getHex() === newFogColor.getHex())

        cloudFunctions.updateCloud(entity, { fogColor: new Color('red') })
        assert(obj3d.fogColor.getHex() === newFogColor.getHex(), 'should not update property to passed value')
      })
    })
  })

  describe('serializeCloud()', () => {
    it('should properly serialize cloud', () => {
      cloudFunctions.deserializeCloud(entity, sceneComponent)
      assert.deepEqual(cloudFunctions.serializeCloud(entity), sceneComponent)
    })

    it('should return undefine if there is no cloud component', () => {
      assert(cloudFunctions.serializeCloud(entity) === undefined)
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
