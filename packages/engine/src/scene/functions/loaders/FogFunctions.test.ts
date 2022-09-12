import assert from 'assert'
import { Color, Fog } from 'three'

import { Engine } from '../../../ecs/classes/Engine'
import { getComponent, hasComponent } from '../../../ecs/functions/ComponentFunctions'
import { createEntity } from '../../../ecs/functions/EntityFunctions'
import { createEngine } from '../../../initializeEngine'
import { FogComponent } from '../../components/FogComponent'
import { FogType } from '../../constants/FogType'
import { deserializeFog, updateFog } from './FogFunctions'

describe('FogFunctions', () => {
  it('deserializeFog', () => {
    createEngine()

    const entity = createEntity()

    const sceneComponentData = {
      type: FogType.Linear,
      color: 'grey',
      density: 2,
      near: 0.1,
      far: 1000
    }

    deserializeFog(entity, sceneComponentData)
    updateFog(entity)

    assert(hasComponent(entity, FogComponent))
    const { type, color, density, near, far } = getComponent(entity, FogComponent)
    assert.equal(type, FogType.Linear)
    assert.deepEqual(color, new Color('grey'))
    assert.equal(density, 2)
    assert.equal(near, 0.1)
    assert.equal(far, 1000)
    assert(Engine.instance.currentWorld.scene.fog instanceof Fog)
  })
})
