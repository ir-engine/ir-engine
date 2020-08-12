import { Component } from "../../ecs/Component"

interface KeyframeInterface {
  attributes: any[]
  duration: number
  direction: string
}

export class Keyframe extends Component<KeyframeInterface> {
  attributes: any[]
  duration: number
  direction: string
}
