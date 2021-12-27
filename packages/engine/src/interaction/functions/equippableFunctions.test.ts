import { createWorld } from "bitecs";
import { Engine } from "../../ecs/classes/Engine";
import { Entity } from "../../ecs/classes/Entity";
import { createEntity } from "../../ecs/functions/EntityFunctions";
import { createBoxComponent } from "./createBoxComponent";
import assert from 'assert';
import { addComponent, hasComponent } from "../../ecs/functions/ComponentFunctions";
import { BoundingBoxComponent } from "../components/BoundingBoxComponent";
import { Group, Quaternion, Vector3 } from "three";
import { Object3DComponent } from "../../scene/components/Object3DComponent";
import { ObjectLayers } from "../../scene/constants/ObjectLayers";
import { TransformComponent } from "../../transform/components/TransformComponent";
import { equipEntity, unequipEntity } from "./equippableFunctions";
import { EquipperComponent } from "../components/EquipperComponent";
import { EquippedComponent } from "../components/EquippedComponent";
import { Network } from "../../networking/classes/Network";
import { TestNetwork } from "../../../tests/networking/TestNetwork";

describe('equippableFunctions', () => {
    let world;

    beforeEach(() => {
        world = createWorld();
        Engine.currentWorld = world;
        Network.instance = new TestNetwork()
    })

    it('equipEntity', () => {
        const entity1: Entity = createEntity(world)
        const entity2: Entity = createEntity(world)
        assert(!hasComponent(entity1, EquipperComponent))
        assert(!hasComponent(entity2, EquippedComponent))
        equipEntity(entity1, entity2)
        assert(hasComponent(entity1, EquipperComponent))
        assert(hasComponent(entity2, EquippedComponent))
    })

    it('unequipEntity', () => {
        const entity1: Entity = createEntity(world)
        const entity2: Entity = createEntity(world)
        equipEntity(entity1, entity2)
        assert(hasComponent(entity1, EquipperComponent))
        unequipEntity(entity1)
        assert(!hasComponent(entity1, EquipperComponent))
    })
})