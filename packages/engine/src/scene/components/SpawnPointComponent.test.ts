import { EntityTreeComponent, getNestedChildren, getOptionalComponent, setComponent } from '@ir-engine/ecs'
import { getMutableState } from '@ir-engine/hyperflux'
import { TransformComponent } from '@ir-engine/spatial'
import { ObjectComponent } from '@ir-engine/spatial/src/renderer/components/ObjectComponent'
import { RendererState } from '@ir-engine/spatial/src/renderer/RendererState'
import { Object3D } from 'three'
import { assert, describe } from 'vitest'
import { it } from '../util/testUtil'
import { SpawnPointComponent } from './SpawnPointComponent'

describe('SpawnPointComponent', () => {
  describe('Fields', () => {
    it('should initialize the *Component.name field with the expected value', () => {
      assert.equal(SpawnPointComponent.name, 'SpawnPointComponent')
    })

    it('should initialize the *Component.jsonID field with the expected value', () => {
      assert.equal(SpawnPointComponent.jsonID, 'EE_spawn_point')
    })
  })

  describe('reactor', () => {
    // This test requires intercepting an HTTP request for the GLTF src
    it.skip('should initialize a child helper entity', async ({ entity }) => {
      getMutableState(RendererState).nodeHelperVisibility.set(true)
      setComponent(entity, SpawnPointComponent)

      let child = getNestedChildren(entity).at(0)
      assert.exists(child)
      child = child!

      let transform = getOptionalComponent(child, TransformComponent)

      assert.exists(transform)
      transform = transform!

      let tree = getOptionalComponent(child, EntityTreeComponent)
      assert.exists(tree)
      tree = tree!

      let object3d = getOptionalComponent(child, ObjectComponent) as Object3D
      assert.exists(object3d)
      object3d = object3d!

      assert(object3d.type === 'mesh')
    })
  })
})
