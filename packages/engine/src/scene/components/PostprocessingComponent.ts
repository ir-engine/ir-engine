import { createMappedComponent } from '../../ecs/functions/ComponentFunctions'
import { EffectPropsSchema } from '../constants/PostProcessing'

export type PostprocessingComponentType = {
  options: EffectPropsSchema
}

export const PostprocessingComponent = createMappedComponent<PostprocessingComponentType>('PostprocessingComponent')
