import { Behavior } from "../../common/interfaces/Behavior";
import { CharacterComponent } from "../components/Character";
import { getMutableComponent, getComponent } from "../../ecs/functions/EntityFunctions";
import { Vector3 } from "three";
import { Vec3 } from "cannon-es";
import { getForward } from "../classes/core/FunctionLibrary";
import { Object3DComponent } from "../../common/components/Object3DComponent";
import { Entity } from "../../ecs/classes/Entity";

export const setArcadeVelocityInfluence: Behavior = (entity, args: { x: number; y: number; z: number; }): void => {
    getMutableComponent<CharacterComponent>(entity, CharacterComponent as any).arcadeVelocityInfluence.set(args.x, args.y, args.z);
};

export const setViewVector: Behavior = (entity, args: { vector: Vector3; }): void => {
    getMutableComponent<CharacterComponent>(entity, CharacterComponent as any).viewVector.copy(args.vector).normalize();
};

export const setPosition: Behavior = (entity, args: { x: number; y: number; z: number; }): void => {
    const character: CharacterComponent = getMutableComponent<CharacterComponent>(entity, CharacterComponent as any);
    character.characterCapsule.body.previousPosition = new Vec3(args.x, args.y, args.z);
    character.characterCapsule.body.position = new Vec3(args.x, args.y, args.z);
    character.characterCapsule.body.interpolatedPosition = new Vec3(args.x, args.y, args.z);
};

export const resetVelocity: Behavior = (entity: Entity): void => {
    const character: CharacterComponent = getMutableComponent<CharacterComponent>(entity, CharacterComponent as any);
    character.velocity.x = 0;
    character.velocity.y = 0;
    character.velocity.z = 0;

    character.characterCapsule.body.velocity.x = 0;
    character.characterCapsule.body.velocity.y = 0;
    character.characterCapsule.body.velocity.z = 0;

    character.velocitySimulator.init();
};

export const setArcadeVelocityTarget: Behavior = (entity, args: { velZ: number; velX: number; velY: number; }): void => {
    const character: CharacterComponent = getMutableComponent<CharacterComponent>(entity, CharacterComponent as any);
    character.velocityTarget.z = args.velZ;
    character.velocityTarget.x = args.velX;
    character.velocityTarget.y = args.velY;
};

export const setOrientation: Behavior = (entity, args: { vector: Vector3; instantly?: boolean; }): void => {
    const character: CharacterComponent = getMutableComponent<CharacterComponent>(entity, CharacterComponent as any);

    let lookVector = new Vector3().copy(args.vector).setY(0).normalize();

    character.orientationTarget.copy(lookVector);

    if (args.instantly) {
        character.orientation.copy(lookVector);
    }
};

export const resetOrientation: Behavior = (entity: Entity): void => {
    const characterObject3D: Object3DComponent = getComponent<Object3DComponent>(entity, Object3DComponent);
    const forward = getForward(characterObject3D.value);
    setOrientation(entity, { vector: forward, instantly: true });
};
