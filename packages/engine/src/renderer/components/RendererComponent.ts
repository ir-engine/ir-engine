import { EffectComposer } from '../classes/postprocessing/core/EffectComposer';
import { PostProcessingSchema } from '../interfaces/PostProcessingSchema';
import { Component } from '../../ecs/classes/Component';
import { Types } from '../../ecs/types/Types';
export class RendererComponent extends Component<any> {
  static instance: RendererComponent
  composer: EffectComposer
  needsResize: boolean
  postProcessingSchema: PostProcessingSchema

  constructor () {
    super();
    RendererComponent.instance = this;
    console.log("Constructor called on renderer component")

  }
}
RendererComponent.schema = {
  composer: { type: Types.Ref },
  needsResize: { type: Types.Boolean },
  postProcessingSchema: { type: Types.Ref }
};
