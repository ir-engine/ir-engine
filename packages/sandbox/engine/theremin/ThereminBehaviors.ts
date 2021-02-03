import { Behavior } from "../../common/interfaces/Behavior"
import { ThereminComponent } from "./ThereminComponent"
import { Entity } from "../../ecs/classes/Entity"
import { getComponentOnEntity, getMutableComponent } from "../../ecs/functions/EntityFunctions"

let theremin: ThereminComponent
// Starts the theremin
export const startOscillator: Behavior = (entity: Entity) => {
  theremin = getComponentOnEntity<ThereminComponent>(entity, ThereminComponent)
  theremin.oscillator = this.context.createOscillator()
  theremin.oscillator.frequency.setTargetAtTime(0, theremin.context.currentTime, 0.001)
  theremin.gainNode.gain.setTargetAtTime(0, theremin.context.currentTime, 0.001)
  theremin.oscillator.connect(theremin.gainNode)
  theremin.oscillator.start(theremin.context.currentTime)
}

export const stopOscillator: Behavior = (entity: Entity) => {
  theremin = getComponentOnEntity(entity, ThereminComponent)
  if (theremin.oscillator) {
    theremin.oscillator.stop(theremin.context.currentTime)
    theremin.oscillator.disconnect()
  }
}

export const setFrequency: Behavior = (entity: Entity, args: { xPos }) => {
  theremin = getComponentOnEntity(entity, ThereminComponent)
  const minFrequency = 2,
    maxFrequency = 800

  theremin.frequency = Math.min(
    Math.max(
      ((args.xPos + theremin.pitchBoundingBox.width * 0.5) / theremin.pitchBoundingBox.width) * maxFrequency +
        minFrequency,
      minFrequency
    )
  )
}

export const calculateGain: Behavior = (entity: Entity, args: { yPos }) => {
  getMutableComponent<ThereminComponent>(entity, ThereminComponent).gain =
    1 -
    Math.abs(
      (args.yPos - theremin.gainBoundingBox.y - theremin.gainBoundingBox.height * 0.5) / theremin.gainBoundingBox.height
    )
}

export const insideBox: Behavior = (entity: Entity, args: { position; box }) => {
  theremin = getComponentOnEntity(entity, ThereminComponent as any)
  return (
    args.position.z < args.box.z + args.box.depth * 0.5 &&
    args.position.z > args.box.z - args.box.depth * 0.5 &&
    args.position.y < args.box.y + args.box.height * 0.5 &&
    args.position.y > args.box.y - args.box.height * 0.5 &&
    args.position.x < args.box.x + args.box.width * 0.5 &&
    args.position.x > args.box.x - args.box.width * 0.5
  )
}

export const changeFrequency: Behavior = (entity: Entity, args: { pitchPosition; gainPosition }) => {
  theremin = getMutableComponent(entity, ThereminComponent as any)
  if (theremin.oscillator) {
    if (args.pitchPosition != undefined && args.gainPosition != undefined) {
      setFrequency(entity, { pitchPosition: args.pitchPosition })
      calculateGain(entity, { gainPosition: args.gainPosition })
    }

    theremin.oscillator.frequency.setTargetAtTime(theremin.frequency, theremin.context.currentTime, 0.001)
    theremin.gainNode.gain.setTargetAtTime(theremin.gain, theremin.context.currentTime, 0.001)
  }
}

export const updatePositions: Behavior = (entity: Entity, args: { positions }) => {
  theremin = getComponentOnEntity(entity, ThereminComponent as any)
  const pitchPosition = Math.max(
    ...args.positions
      .filter(position => {
        return insideBox(entity, { position, pitchBoundingBox: theremin.pitchBoundingBox })
      })
      .map(position => {
        return position.x
      })
  )

  const gainPosition = Math.max(
    ...args.positions
      .filter(position => {
        theremin = getComponentOnEntity(entity, ThereminComponent as any)
        return insideBox(entity, { position, gainBoundingBox: theremin.gainBoundingBox })
      })
      .map(position => {
        return position.y
      })
  )
  changeFrequency(entity, { pitchPosition, gainPosition })
}
