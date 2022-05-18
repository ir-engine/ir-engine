import assert from 'assert'
import { Group, Quaternion, Vector3 } from 'three'

import { Engine } from '../../ecs/classes/Engine'
import { Entity } from '../../ecs/classes/Entity'
import { createWorld } from '../../ecs/classes/World'
import { addComponent, hasComponent } from '../../ecs/functions/ComponentFunctions'
import { createEntity } from '../../ecs/functions/EntityFunctions'
import { Object3DComponent } from '../../scene/components/Object3DComponent'
import { ObjectLayers } from '../../scene/constants/ObjectLayers'
import { TransformComponent } from '../../transform/components/TransformComponent'
import { BoundingBoxComponent } from '../components/BoundingBoxComponent'
import { createBoxComponent } from './createBoxComponent'

describe('createBoxComponent', () => {
  beforeEach(() => {
    Engine.currentWorld = createWorld()
  })

  it('createBoxComponent', () => {
    const entity: Entity = createEntity()

    const tiltContainer = new Group()
    tiltContainer.name = 'Actor (tiltContainer)' + entity
    addComponent(entity, Object3DComponent, { value: tiltContainer })
    tiltContainer.traverse((o) => {
      o.layers.disable(ObjectLayers.Scene)
      o.layers.enable(ObjectLayers.Avatar)
    })
    addComponent(entity, TransformComponent, {
      position: new Vector3(0, 0, 0),
      rotation: new Quaternion(),
      scale: new Vector3(1, 1, 1)
    })

    createBoxComponent(entity)
    assert(hasComponent(entity, BoundingBoxComponent))
  })
})
