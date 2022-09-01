import { Material } from 'three'

import { Entity } from '../../ecs/classes/Entity'
import { createMappedComponent } from '../../ecs/functions/ComponentFunctions'

export type MaterialMap = {
  id: string
  material: Material
}

export type AvatarEffectComponentType = {
  /**
   * the entity whose spawning effect this is
   */
  sourceEntity: Entity
  opacityMultiplier: number
  originMaterials: Array<MaterialMap>
}

export const AvatarEffectComponent = createMappedComponent<AvatarEffectComponentType>('AvatarEffectComponent')
