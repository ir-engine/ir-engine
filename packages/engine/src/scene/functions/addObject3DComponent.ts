/** This Module contains function to perform different operations on
 *    {@link https://threejs.org/docs/#api/en/core/Object3D | Object3D } from three.js library.
 * @packageDocumentation
 * */

import { Object3DComponent } from '../components/Object3DComponent'
import { Object3D } from 'three'
import { Entity } from '../../ecs/classes/Entity'
import { addComponent } from '../../ecs/functions/ComponentFunctions'
import { applyArgsToObject3d } from './applyArgsToObject3d'

/**
 * Add Object3D Component with args into Entity from the Behavior.
 */

export const addObject3DComponent = <T extends Object3D>(entity: Entity, object3d: T, objArgs?: any) => {
  if (objArgs) applyArgsToObject3d(entity, object3d, objArgs)

  addComponent(entity, Object3DComponent, { value: object3d })

  return entity
}
