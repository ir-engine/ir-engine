import {
  createEngine,
  createEntity,
  destroyEngine,
  getChildrenWithComponents,
  getComponent,
  getOptionalComponent,
  removeEntity,
  setComponent,
  UndefinedEntity
} from '@ir-engine/ecs'
import { assertArray } from '@ir-engine/spatial/tests/util/assert.ts'
import { afterEach, assert, beforeEach, describe, it } from 'vitest'
import { GLTFComponent } from '../../gltf/GLTFComponent.tsx'
import { deviceMetadataSchema, distanceMetadataSchema, VariantComponent } from './VariantComponent.tsx'

const VariantComponentDefaults = {
  levels: [] as Array<{
    src: string
    metadata: typeof distanceMetadataSchema | typeof deviceMetadataSchema
    heuristic: number
    currentLevel: number
  }>
}

function assertVariantComponentEqual(data, expected) {
  assertArray.eq(data.levels, expected.levels)
}
describe('VariantComponent', () => {
  describe('onInit', () => {
    let testEntity = UndefinedEntity

    beforeEach(async () => {
      createEngine()
      testEntity = createEntity()
      setComponent(testEntity, VariantComponent)
    })

    afterEach(() => {
      removeEntity(testEntity)
      return destroyEngine()
    })

    it('should initialize the component with the expected default values', () => {
      const data = getComponent(testEntity, VariantComponent)
      assertVariantComponentEqual(data, VariantComponentDefaults)
    })
  }) // << onInit

  describe('reactor', () => {
    let testEntity = UndefinedEntity

    beforeEach(async () => {
      createEngine()
      testEntity = createEntity()
      setComponent(testEntity, VariantComponent)
    })

    afterEach(() => {
      removeEntity(testEntity)
      return destroyEngine()
    })

    it('should have a child entity with a GLTFComponent', () => {
      const childEntity = getChildrenWithComponents(testEntity, [GLTFComponent]).at(0)
      assert.notEqual(childEntity, UndefinedEntity)
    })

    it('should not have a GLTFComponent', () => {
      const gltfComponent = getOptionalComponent(testEntity, GLTFComponent)
      assert.equal(gltfComponent, undefined)
    })
  }) // << reactor
})
