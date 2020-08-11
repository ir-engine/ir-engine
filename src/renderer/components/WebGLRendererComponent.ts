import { Component, Types } from "ecsy"

export class WebGLRendererComponent extends Component<any> {
  static instance: WebGLRendererComponent
  renderer: any
  needsResize: boolean
  constructor() {
    super()
    WebGLRendererComponent.instance = this
  }
}
WebGLRendererComponent.schema = {
  renderer: { type: Types.Ref }
}
