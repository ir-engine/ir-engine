import assert from 'assert'
import { Color, HemisphereLight } from 'three'

import { Engine } from '../../../ecs/classes/Engine'
import { getComponent, hasComponent } from '../../../ecs/functions/ComponentFunctions'
import { createEntity } from '../../../ecs/functions/EntityFunctions'
import { addEntityNodeChild, createEntityNode } from '../../../ecs/functions/EntityTree'
import { createEngine } from '../../../initializeEngine'
import { HemisphereLightComponent } from '../../components/HemisphereLightComponent'
import { deserializeHemisphereLight, updateHemisphereLight } from './HemisphereLightFunctions'

describe('HemisphereLightFunctions', () => {
  it('deserializeHemisphereLight', async () => {
    createEngine()

    const entity = createEntity()
    const node = createEntityNode(entity)
    const world = Engine.instance.currentWorld
    addEntityNodeChild(node, world.entityTree.rootNode)

    const color = new Color('pink')
    const sceneComponentData = {
      skyColor: color.clone(),
      intensity: 5
    }

    deserializeHemisphereLight(entity, sceneComponentData)
    updateHemisphereLight(entity)

    assert(hasComponent(entity, HemisphereLightComponent))
    assert(getComponent(entity, HemisphereLightComponent).light instanceof HemisphereLight)
    assert(getComponent(entity, HemisphereLightComponent).light!.color instanceof Color)
    assert.deepEqual(getComponent(entity, HemisphereLightComponent).light!.color, color)
    assert.deepEqual(getComponent(entity, HemisphereLightComponent).light!.intensity, 5)
  })
})
