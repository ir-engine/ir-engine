import { Material } from 'three'
import { createMappedComponent } from '../../ecs/ComponentFunctions'

export type MaterialMap = {
  id: string
  material: Material
}

export type AvatarEffectComponentType = {
  opacityMultiplier: number
  originMaterials: Array<MaterialMap>
}

export const AvatarEffectComponent = createMappedComponent<AvatarEffectComponentType>('AvatarEffectComponent')
