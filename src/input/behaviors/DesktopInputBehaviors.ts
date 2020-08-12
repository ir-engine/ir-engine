import { BinaryValue } from "../../common/enums/BinaryValue"
import { Behavior } from "../../common/interfaces/Behavior"
import { Binary } from "../../common/types/NumericalTypes"
import { Entity } from "../../ecs/Entity"
import { InputType } from "../../input/enums/InputType"
import { Input } from "../components/Input"

// Local reference to input component
let input: Input
const _value: [number, number] = [0, 0]
// System behavior called whenever the mouse pressed
export const handleMouseMovement: Behavior = (entity: Entity, args: { event: MouseEvent }): void => {
  input = entity.getComponent(Input)
  _value[0] = (args.event.clientX / window.innerWidth) * 2 - 1
  _value[1] = (args.event.clientY / window.innerHeight) * -2 + 1
  // Set type to TWOD (two-dimensional axis) and value to a normalized -1, 1 on X and Y
  input.data.set(input.schema.mouseInputMap.axes["mousePosition"], {
    type: InputType.TWOD,
    value: _value
  })
}

// System behavior called when a mouse button is fired
export const handleMouseButton: Behavior = (entity: Entity, args: { event: MouseEvent; value: Binary }): void => {
  // Get immutable reference to Input and check if the button is defined -- ignore undefined buttons
  input = entity.getMutableComponent(Input)
  if (input.schema.mouseInputMap.buttons[args.event.button] === undefined) return // Set type to BUTTON (up/down discrete state) and value to up or down, as called by the DOM mouse events
  if (args.value === BinaryValue.ON) {
    input.data.set(input.schema.mouseInputMap.buttons[args.event.button], {
      type: InputType.BUTTON,
      value: args.value
    })
    const mousePosition: [number, number] = [0, 0]
    mousePosition[0] = (args.event.clientX / window.innerWidth) * 2 - 1
    mousePosition[1] = (args.event.clientY / window.innerHeight) * -2 + 1
    input.data.set(input.schema.mouseInputMap.axes["mouseClickDownPosition"], {
      type: InputType.TWOD,
      value: mousePosition
    })
  } else {
    input.data.delete(input.schema.mouseInputMap.buttons[args.event.button])
    input.data.delete(input.schema.mouseInputMap.axes["mouseClickDownPosition"])
    input.data.delete(input.schema.mouseInputMap.axes["mouseClickDownTransformRotation"])
  }
}

// System behavior called when a keyboard key is pressed
export function handleKey(entity: Entity, args: { event: KeyboardEvent; value: Binary }): any {
  // Get immutable reference to Input and check if the button is defined -- ignore undefined keys
  input = entity.getComponent(Input)
  if (input.schema.keyboardInputMap[args.event.key] === undefined) return
  // If the key is in the map but it's in the same state as now, let's skip it (debounce)
  if (
    input.data.has(input.schema.keyboardInputMap[args.event.key]) &&
    input.data.get(input.schema.keyboardInputMap[args.event.key]).value === args.value
  )
    return
  // Set type to BUTTON (up/down discrete state) and value to up or down, depending on what the value is set to
  if (args.value === BinaryValue.ON) {
    input.data.set(input.schema.keyboardInputMap[args.event.key], {
      type: InputType.BUTTON,
      value: args.value
    })
  } else {
    input.data.delete(input.schema.mouseInputMap.buttons[args.event.key])
    input.data.set(input.schema.keyboardInputMap[args.event.key], {
      type: InputType.BUTTON,
      value: args.value
    })
  }
}
