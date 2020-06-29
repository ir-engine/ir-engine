import { System, Entity } from "ecsy"
import MouseInput from "../components/MouseInput"
import ActionValues from "../enums/ActionValues"
import ActionQueue from "../components/ActionQueue"
import Input from "../components/Input"
import AxisQueue from "../components/AxisQueue"
import AxisType from "../enums/AxisType"

export default class MouseInputSystem extends System {
  // Temp variables
  private _mouse: MouseInput
  public execute(): void {
    this.queries.axis.added.forEach(ent => {
      this._mouse = ent.getMutableComponent(MouseInput)
      document.addEventListener("mousemove", e => (this._mouse.moveHandler = this.moveHandler(e, ent)), false)
    })
    this.queries.buttons.added.forEach(ent => {
      this._mouse = ent.getMutableComponent(MouseInput)
      document.addEventListener(
        "mousedown",
        e => (this._mouse.downHandler = this.buttonHandler(e, ent, ActionValues.START)),
        false
      )
      document.addEventListener(
        "mouseup",
        e => (this._mouse.upHandler = this.buttonHandler(e, ent, ActionValues.END)),
        false
      )
    })
    this.queries.axis.removed.forEach(ent => {
      const mouse = ent.getComponent(MouseInput)
      if (mouse) document.removeEventListener("mousemove", mouse.upHandler)
    })
    this.queries.buttons.removed.forEach(ent => {
      const mouse = ent.getComponent(MouseInput)
      if (mouse) document.removeEventListener("mousedown", mouse.downHandler)
      if (mouse) document.removeEventListener("mouseup", mouse.moveHandler)
    })
  }

  private moveHandler = (e: MouseEvent, entity: Entity): void => {
    entity.getComponent(AxisQueue).axes.add({
      axis: AxisType.SCREENXY,
      value: { x: e.clientX, y: e.clientY }
    })
  }

  private buttonHandler = (e: MouseEvent, entity: Entity, value: ActionValues): void => {
    this._mouse = entity.getComponent(MouseInput)
    if (!this._mouse || this._mouse.actionMap[e.button] === undefined) return
    entity.getMutableComponent(ActionQueue).actions.add({
      action: this._mouse.actionMap[e.button],
      value: value
    })
  }
}

MouseInputSystem.queries = {
  buttons: {
    components: [MouseInput, ActionQueue, Input],
    listen: {
      added: true,
      removed: true
    }
  },
  axis: {
    components: [MouseInput, AxisQueue, Input],
    listen: {
      added: true,
      removed: true
    }
  }
}
