import { PostProcessingSchema } from '../../postprocessing/interfaces/PostProcessingSchema';
import { Component } from '../../ecs/classes/Component';
import { Types } from '../../ecs/types/Types';
import { EffectComposer } from '../../postprocessing/core/EffectComposer';
export class RendererComponent extends Component<any> {
  static instance: RendererComponent
  composer: EffectComposer
  needsResize: boolean
  postProcessingSchema: PostProcessingSchema
  /**
     * Constructs a new renderer
     */
  constructor() {
    super();
    RendererComponent.instance = this;
    console.log("Constructor called on renderer component")

  }
}
/**
  * The scheme is used to set the default values of a component. 
  * The type field must be set for each property.
  */
RendererComponent.schema = {
  composer: { type: Types.Ref },
  needsResize: { type: Types.Boolean },
  postProcessingSchema: { type: Types.Ref }
};
