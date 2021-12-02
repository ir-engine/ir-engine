import { createMappedComponent } from '../../ecs/functions/ComponentFunctions'
import { EffectPropsSchema } from '../classes/PostProcessing'

export type PostprocessingComponentType = {
  option: EffectPropsSchema
}

export const PostprocessingComponent = createMappedComponent('PostprocessingComponent')
