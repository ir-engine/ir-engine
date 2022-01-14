import { ComponentJson } from '@xrengine/common/src/interfaces/SceneInterface'
import assert from 'assert'
import { Object3D } from 'three'
import { Engine } from '../../../ecs/classes/Engine'
import { createWorld } from '../../../ecs/classes/World'
import { getComponent, hasComponent } from '../../../ecs/functions/ComponentFunctions'
import { createEntity } from '../../../ecs/functions/EntityFunctions'
import { InteractableComponent } from '../../../interaction/components/InteractableComponent'
import { LinkComponent } from '../../components/LinkComponent'
import { Object3DComponent } from '../../components/Object3DComponent'
import { deserializeLink } from './LinkFunctions'

describe('LinkFunctions', () => {
  it('deserializeLink', () => {
    const world = createWorld()
    Engine.currentWorld = world
    const entity = createEntity()

    const sceneComponentData = {
      href: 'https://google.com/'
    }
    const sceneComponent: ComponentJson = {
      name: 'link',
      props: sceneComponentData
    }

    deserializeLink(entity, sceneComponent)

    assert(hasComponent(entity, Object3DComponent))
    assert(getComponent(entity, Object3DComponent).value instanceof Object3D)
    assert(getComponent(entity, LinkComponent).href, 'https://google.com/')

    assert(hasComponent(entity, InteractableComponent))
    assert.deepStrictEqual(getComponent(entity, InteractableComponent), { action: 'link' })

  })
})