import { createMappedComponent } from '../../ecs/functions/ComponentFunctions'
import { EffectPropsSchema } from '../classes/PostProcessing'

export type PostprocessingComponentType = {
  options: EffectPropsSchema
}

export const PostprocessingComponent = createMappedComponent<PostprocessingComponentType>('PostprocessingComponent')
