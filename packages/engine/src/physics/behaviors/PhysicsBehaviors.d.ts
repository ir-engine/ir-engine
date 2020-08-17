import { Body } from "cannon-es/src/objects/Body";
import { Entity } from "../../ecs/classes/Entity";
export declare function createBox(entity: Entity): Body;
export declare function createGroundGeometry(entity: Entity): Body;
export declare function createCylinder(entity: Entity): Body;
export declare function createSphere(entity: Entity): Body;
export declare function createConvexGeometry(entity: Entity): Body;
