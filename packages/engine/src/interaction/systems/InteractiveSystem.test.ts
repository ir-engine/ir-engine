import { Engine } from "../../ecs/classes/Engine";
import { Entity } from "../../ecs/classes/Entity";
import { createWorld } from "../../ecs/classes/World";
import { addComponent, hasComponent } from "../../ecs/functions/ComponentFunctions";
import { createEntity } from "../../ecs/functions/EntityFunctions";
import { InteractableComponent } from "../components/InteractableComponent";
import InteractiveSystem from "./InteractiveSystem";
import assert from 'assert';
import { BoundingBoxComponent } from "../components/BoundingBoxComponent";
import { SubFocusedComponent } from "../components/SubFocusedComponent";
import { HighlightComponent } from "../../renderer/components/HighlightComponent";
import { InteractedComponent } from "../components/InteractedComponent";
import { ParityValue } from '../../common/enums/ParityValue'

describe('interactiveSystem', () => {
    let world;
    let interactiveSystem;

    before (async() => {
        world = createWorld()
        Engine.currentWorld = world
        interactiveSystem = await InteractiveSystem(world)
    })

    it('interactorsQuery & interactiveQuery', () => {
        const entity: Entity = createEntity(world)
        addComponent(entity, InteractableComponent, { data: { interactionType: 'link', action: 'link' } })
        interactiveSystem()
        assert(!hasComponent(entity, BoundingBoxComponent))
    })

    it('subfocusQuery', () => {
        const entity: Entity = createEntity(world)
        const entity2: Entity = createEntity(world)
        addComponent(entity, InteractableComponent, { data: { action: 'link' } })
        addComponent(entity, SubFocusedComponent, { subInteracts: entity2 })
        interactiveSystem()
        assert(hasComponent(entity, HighlightComponent))
    })

    it('interactedQuery', () => {
        const entity: Entity = createEntity(world)
        const entity2: Entity = createEntity(world)
        addComponent(entity, InteractableComponent, { data: { interactionType: 'link', action: 'link' } })
        addComponent(entity, InteractedComponent, { interactor: entity2, parity: ParityValue.LEFT })
        interactiveSystem()
        assert(!hasComponent(entity, InteractedComponent))
    })
})