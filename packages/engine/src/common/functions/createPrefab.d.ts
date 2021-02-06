import { Prefab } from '../interfaces/Prefab';
import { Entity } from '../../ecs/classes/Entity';
/**
 * Create Entity from a Prefab.
 * @param prefab Prefab from which entity will be created.
 * @returns Newly created Entity.
 */
export declare function createPrefab(prefab: Prefab): Entity;
