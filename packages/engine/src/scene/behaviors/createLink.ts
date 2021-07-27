import { Object3D } from 'three'
import { addComponent } from '../../ecs/functions/EntityFunctions'
import { Interactable } from '../../interaction/components/Interactable'
import { addObject3DComponent } from './addObject3DComponent'

export const createLink = (entity, args: { href: string }) => {
  addObject3DComponent(entity, new Object3D(), args)
  addComponent(entity, Interactable, { data: { action: 'link' } })
}
