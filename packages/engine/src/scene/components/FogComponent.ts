import { Color } from 'three'
import { ComponentName } from '../../common/constants/ComponentNames'
import { createMappedComponent } from '../../ecs/functions/ComponentFunctions'
import { FogType } from '../constants/FogType'

export type FogComponentType = {
  type: FogType
  color: Color
  density: number
  near: number
  far: number
}

export const FogComponent = createMappedComponent<FogComponentType>(ComponentName.FOG)
