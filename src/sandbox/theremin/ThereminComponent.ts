import { Component } from "ecsy"

Number.prototype.clamp = function(min, max) {
  return Math.min(Math.max(this, min), max)
}

export class ThereminComponent extends Component<any> {
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
