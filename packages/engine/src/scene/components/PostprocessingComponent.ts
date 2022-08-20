import { createMappedComponent } from '../../ecs/functions/ComponentFunctions'
import { defaultPostProcessingSchema, EffectPropsSchema } from '../constants/PostProcessing'

export type PostprocessingComponentType = {
  options: EffectPropsSchema
}

export const PostprocessingComponent = createMappedComponent<PostprocessingComponentType>('PostprocessingComponent')

export const SCENE_COMPONENT_POSTPROCESSING = 'postprocessing'
export const SCENE_COMPONENT_POSTPROCESSING_DEFAULT_VALUES = {
  options: defaultPostProcessingSchema
}
