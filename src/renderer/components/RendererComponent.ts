import { EffectComposer } from "postprocessing"
import { Component, Types } from "../../ecs"
import { PostProcessingSchema } from "../interfaces/PostProcessingSchema"
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
