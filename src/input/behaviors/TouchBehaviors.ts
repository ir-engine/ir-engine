import { Entity } from "ecsy"
import { BinaryValue } from "../../common/enums/BinaryValue"
import { Behavior } from "../../common/interfaces/Behavior"
import { Binary } from "../../common/types/NumericalTypes"

export const handleTouch: Behavior = (entity: Entity, args: { event: TouchEvent; value: Binary }): void => {
  if (args.value === BinaryValue.ON) {
    let s = "Touch start."
    if (args.event.targetTouches.length)
      s +=
        " x: " +
        Math.trunc(args.event.targetTouches[0].clientX) +
        ", y: " +
        Math.trunc(args.event.targetTouches[0].clientY)
    console.log(s)
  } else {
    console.log("Touch end.")
  }
}

export const handleTouchMove: Behavior = (entity: Entity, args: { event: TouchEvent }): void => {
  let s = "Touch move."
  if (args.event.targetTouches.length)
    s +=
      " x: " +
      Math.trunc(args.event.targetTouches[0].clientX) +
      ", y: " +
      Math.trunc(args.event.targetTouches[0].clientY)
  console.log(s)
}
