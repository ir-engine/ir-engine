import { Component, Types } from "ecsy"
import { EffectComposer } from "postprocessing"
import { PostProcessingSchema } from "../interfaces/PostProcessingSchema"
export class WebGLRendererComponent extends Component<any> {
  static instance: WebGLRendererComponent
  renderer: any
  composer: EffectComposer
  needsResize: boolean
  postProcessingSchema: PostProcessingSchema

  constructor() {
    super()
    WebGLRendererComponent.instance = this
  }
}
WebGLRendererComponent.schema = {
  renderer: { type: Types.Ref }
}
