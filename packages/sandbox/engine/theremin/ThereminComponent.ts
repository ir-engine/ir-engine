import { Component } from "../../ecs/classes/Component"
import { Types } from "../../ecs/types/Types"

export class ThereminComponent extends Component<ThereminComponent> {
  pitchBoundingBox: any
  gainBoundingBox: any
  context: AudioContext
  gainNode: any
  oscillator: any
  frequency = 0
  gain = 0
  constructor(pitchBoundingBox, gainBoundingBox) {
    super()
    this.pitchBoundingBox = pitchBoundingBox
    this.gainBoundingBox = gainBoundingBox

    this.context = new AudioContext()
    this.gainNode = this.context.createGain()
    this.gainNode.connect(this.context.destination)
  }
}
ThereminComponent.schema = {
  pitchBoundingBox: { type: Types.Ref, default: null },
  gainBoundingBox: { type: Types.Ref, default: null },
  context: { type: Types.Ref, default: null },
  gainNode: { type: Types.Ref, default: null },
  oscillator: { type: Types.Ref, default: null },
  frequency: { type: Types.Number, default: 0 },
  gain: { type: Types.Number, default: 0 }
}
