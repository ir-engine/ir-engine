import assert from 'assert'
import { Types } from 'bitecs'
import { Vector3 } from 'three'
import { Engine } from '../classes/Engine'
import { createWorld } from '../classes/World'
import { ComponentMap, createMappedComponent } from './ComponentFunctions'

describe('ComponentFunctions', async () => {
  beforeEach(() => {
    const world = createWorld()
    Engine.currentWorld = world
    ComponentMap.clear()
  })

  afterEach(() => {
    ComponentMap.clear()
  })

  describe('createMappedComponent', () => {
    it('should create tag component', () => {
      const TagComponent = createMappedComponent('TagComponent')

      assert.equal(TagComponent._name, 'TagComponent')
      assert.equal(typeof (TagComponent as any)._schema, 'undefined')
      assert.equal((TagComponent as any)._map.size, 0)
      assert.equal(ComponentMap.size, 1)
    })

    it('should create mapped component with SoA', () => {
      type Vector3ComponentType = {
        position: Vector3
      }
      const { f32 } = Types
      const Vector3Schema = { x: f32, y: f32, z: f32 }
      const Vector3Component = createMappedComponent<Vector3ComponentType, typeof Vector3Schema>(
        'Vector3Component',
        Vector3Schema
      )

      assert.equal(Vector3Component._name, 'Vector3Component')
      assert.equal((Vector3Component as any)._schema, Vector3Schema)
      assert.equal((Vector3Component as any)._map.size, 0)
      assert.equal(ComponentMap.size, 1)
    })

    it('should create mapped component with bitecs store', () => {})
  })
})
