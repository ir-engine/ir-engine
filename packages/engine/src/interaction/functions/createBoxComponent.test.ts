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

describe('createBoxComponent', () => {
    let world;

    beforeEach(() => {
        world = createWorld();
        Engine.currentWorld = world;
    })

    it('createBoxComponent', () => {
        const entity: Entity = createEntity(world)
                
        const tiltContainer = new Group()
        tiltContainer.name = 'Actor (tiltContainer)' + entity
        addComponent(entity, Object3DComponent, { value: tiltContainer })
        tiltContainer.traverse((o) => {
          o.layers.disable(ObjectLayers.Scene)
          o.layers.enable(ObjectLayers.Avatar)
        })
        addComponent(entity, TransformComponent, 
            { position: new Vector3(0, 0, 0), rotation: new Quaternion(), scale: new Vector3(1, 1, 1) })
        
        
        createBoxComponent(entity)
        assert(hasComponent(entity, BoundingBoxComponent))
    })
})