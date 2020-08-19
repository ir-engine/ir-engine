import { EffectComposer } from '../classes/postprocessing/core/EffectComposer';
import { PostProcessingSchema } from '../interfaces/PostProcessingSchema';
import { Component } from '../../ecs/classes/Component';
import { Types } from '../../ecs/types/Types';
export class RendererComponent extends Component<any> {
  static instance: RendererComponent
  composer: EffectComposer
  needsResize: boolean
  postProcessingSchema: PostProcessingSchema
  /**
     * Constructs a new renderer component
     *
     * @param  {} {super()}
     *
     */
  constructor() {
    super();
    RendererComponent.instance = this;
    console.log("Constructor called on renderer component")

  }
}
/**
  * The scheme is used to set the default values of a component
  */
RendererComponent.schema = {
  composer: { type: Types.Ref },
  needsResize: { type: Types.Boolean },
  postProcessingSchema: { type: Types.Ref }
};
