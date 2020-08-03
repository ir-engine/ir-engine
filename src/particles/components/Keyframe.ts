import { Component } from "ecsy"

interface KeyframeInterface {
  attributes: any[]
  duration: number
  direction: string
}

export class Keyframe extends Component<KeyframeInterface> {
  attributes: any[]
  duration: number
  direction: string

  // reset(): void {
  //   this.attributes = []
  //   this.duration = 1
  //   this.direction = "ping-pong"
  // }
}
