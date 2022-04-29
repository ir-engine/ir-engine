import assert from 'assert'

import { ParityValue } from '../../common/enums/ParityValue'
import { Engine } from '../../ecs/classes/Engine'
import { Entity } from '../../ecs/classes/Entity'
import { addComponent, hasComponent } from '../../ecs/functions/ComponentFunctions'
import { createEntity } from '../../ecs/functions/EntityFunctions'
import { BoundingBoxComponent } from '../components/BoundingBoxComponent'
import { InteractableComponent } from '../components/InteractableComponent'
import { InteractedComponent } from '../components/InteractedComponent'
import InteractiveSystem from './InteractiveSystem'

/**
 * @TODO requries fixing hookstate props
 *
 */

// describe('interactiveSystem', () => {
//   let interactiveSystem

//   before(async () => {
//     createEngine()
//     interactiveSystem = await InteractiveSystem()
//   })

//   it('interactorsQuery & interactiveQuery', () => {
//     const world = Engine.instance.currentWorld
//     const entity: Entity = createEntity(world)
//     addComponent(entity, InteractableComponent, { interactionType: 'equippable', action: 'link' })
//     interactiveSystem()
//     assert(!hasComponent(entity, BoundingBoxComponent))
//   })

//   it('interactedQuery', () => {
//     const world = Engine.instance.currentWorld
//     const entity: Entity = createEntity(world)
//     const entity2: Entity = createEntity(world)
//     addComponent(entity, InteractableComponent, { interactionType: 'link', action: 'link' })
//     addComponent(entity, InteractedComponent, { interactor: entity2, parity: ParityValue.LEFT })
//     interactiveSystem()
//     assert(!hasComponent(entity, InteractedComponent))
//   })
// })

export {}
