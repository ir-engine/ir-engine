import { Body } from 'cannon-es';
import { Entity } from '../../ecs/classes/Entity';
export declare function createTrimesh(mesh: any, position: any, mass: any): Body;
export declare function createGround(entity: Entity): Body;
export declare function createBox(entity: Entity): Body;
export declare function createCylinder(entity: Entity): Body;
export declare function createSphere(entity: Entity): Body;
export declare function createConvexGeometry(entity: Entity, mesh: any): Body;
