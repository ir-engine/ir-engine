import { EffectComposer } from "../../postprocessing/core/EffectComposer"
import { PostProcessingSchema } from "../interfaces/PostProcessingSchema"
import { Component } from "../../ecs/classes/Component"
import { Types } from "../../ecs/types/Types"
export class RendererComponent extends Component<any> {
  static instance: RendererComponent
  renderer: any
  composer: EffectComposer
  needsResize: boolean
  postProcessingSchema: PostProcessingSchema

  constructor() {
    super()
    RendererComponent.instance = this
  }
}
RendererComponent.schema = {
  renderer: { type: Types.Ref }
}
