import { Color } from 'three'
import { Entity } from '../../ecs/classes/Entity'
import { addComponent } from '../../ecs/functions/ComponentFunctions'
import { Engine } from '../../ecs/classes/Engine'
import { Object3DComponent } from '../components/Object3DComponent'
import { isClient } from '@xrengine/engine/src/common/functions/isClient'
import { PostprocessingComponent, PostprocessingComponentType } from '../components/PostprocessingComponent'

export const createPostprocessing = async function (
  entity: Entity,
  component: PostprocessingComponentType
): Promise<void> {
  if (!isClient) return

  addComponent(entity, PostprocessingComponent, component)
}
