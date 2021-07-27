/** This Module contains function to perform different operations on
 *    {@link https://threejs.org/docs/#api/en/core/Object3D | Object3D } from three.js library.
 * @packageDocumentation
 * */

import { Object3DComponent } from '../components/Object3DComponent'
import { Object3D } from 'three'
import { Entity } from '../../ecs/classes/Entity'
import { hasComponent, getComponent, addComponent } from '../../ecs/functions/EntityFunctions'
import { applyArgsToObject3d } from './applyArgsToObject3d'

/**
 * Add Object3D Component with args into Entity from the Behavior.
 */

export const addObject3DComponent = <T extends Object3D>(
  entity: Entity,
  object3d: T,
  objArgs?: any,
  parentEntity?: Entity
) => {
  applyArgsToObject3d(entity, object3d, true, objArgs, parentEntity)

  addComponent(entity, Object3DComponent, { value: object3d })

  if (parentEntity && hasComponent(parentEntity, Object3DComponent)) {
    getComponent(parentEntity, Object3DComponent).value.add(object3d)
  }
  return entity
}
