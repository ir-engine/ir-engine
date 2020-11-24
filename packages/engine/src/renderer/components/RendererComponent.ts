import { PostProcessingSchema } from '../../postprocessing/interfaces/PostProcessingSchema';
import { Component } from '../../ecs/classes/Component';
import { Types } from '../../ecs/types/Types';
import { EffectComposer } from '../../postprocessing/core/EffectComposer';
import { DefaultPostProcessingSchema } from '../../templates/postprocessing/DefaultPostProcessingSchema';
export class RendererComponent extends Component<any> {
  static instance: RendererComponent
  composer: EffectComposer
  needsResize: boolean
  postProcessingSchema: PostProcessingSchema
  /**
     * Constructs a new renderer
     */
  constructor(postProcessingSchema?: PostProcessingSchema) {
    super();
    RendererComponent.instance = this;
    this.postProcessingSchema = postProcessingSchema ?? DefaultPostProcessingSchema;
  }

  dispose() {
    super.dispose();
    this.composer?.dispose();
    this.composer = null;
    RendererComponent.instance = null;
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
