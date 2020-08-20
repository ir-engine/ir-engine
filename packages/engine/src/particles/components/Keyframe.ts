import { Component } from "../../ecs/classes/Component"

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
