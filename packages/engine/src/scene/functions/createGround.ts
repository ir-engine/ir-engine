import { Color } from 'three'
import { Entity } from '../../ecs/classes/Entity'
import { addComponent } from '../../ecs/functions/ComponentFunctions'
import { createCollider } from '../../physics/functions/createCollider'
import { GroundPlaneComponent, GroundPlaneComponentType } from '../../scene/components/GroundPlaneComponent'
import { Engine } from '../../ecs/classes/Engine'
import GroundPlane from '../classes/GroundPlane'
import { Object3DComponent } from '../components/Object3DComponent'

export const createGround = async function (entity: Entity, component: GroundPlaneComponentType): Promise<void> {
  const groundPlane = new GroundPlane()
  addComponent(entity, Object3DComponent, { value: groundPlane })

  component.dirty = true
  component.color = new Color(component.color)
  addComponent(entity, GroundPlaneComponent, component)

  if (!Engine.isEditor) createCollider(entity, groundPlane.mesh)
}
