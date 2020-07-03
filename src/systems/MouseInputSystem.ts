import { System, Entity } from "ecsy"
import MouseInput from "../components/MouseInput"
import LifecycleValue from "../enums/LifecycleValue"
import InputActionHandler from "../components/InputActionHandler"
import UserInput from "../components/UserInput"
import InputAxisHandler2D from "../components/InputAxisHandler2D"
import { enableScroll, disableScroll } from "../utils/EnableDisableScrolling"

export default class MouseInputSystem extends System {
  // Temp variables
  private _mouse: Entity
  private _axisHandler: InputAxisHandler2D
  public execute(): void {
    this.queries.axis.added.forEach(ent => {
      this._mouse = ent
      document.addEventListener(
        "mousemove",
        e => (this._mouse.getMutableComponent(MouseInput).moveHandler = this.moveHandler(e, ent)),
        false
      )
    })
    this.queries.buttons.added.forEach(ent => {
      this._mouse = ent
      document.addEventListener("contextmenu", event => event.preventDefault())
      disableScroll()
      document.addEventListener(
        "mousedown",
        e =>
          (this._mouse.getMutableComponent(MouseInput).downHandler = this.buttonHandler(e, ent, LifecycleValue.STARTED)),
        false
      )
      document.addEventListener(
        "mouseup",
        e => (this._mouse.getMutableComponent(MouseInput).upHandler = this.buttonHandler(e, ent, LifecycleValue.ENDED)),
        false
      )
    })
    this.queries.axis.removed.forEach(() => {
      if (this._mouse)
        document.removeEventListener("mousemove", this._mouse.getMutableComponent(MouseInput).moveHandler)
    })
    this.queries.buttons.removed.forEach(() => {
      document.removeEventListener("contextmenu", event => event.preventDefault())
      enableScroll()
      if (this._mouse) {
        document.removeEventListener("mousedown", this._mouse.getMutableComponent(MouseInput).downHandler)
        document.removeEventListener("mouseup", this._mouse.getMutableComponent(MouseInput).upHandler)
      }
    })
  }

  private moveHandler = (e: MouseEvent, entity: Entity): void => {
    entity.getComponent(InputAxisHandler2D).queue.add({
      axis: this._mouse.getComponent(MouseInput).axisMap.mousePosition,
      value: { x: e.clientX, y: e.clientY }
    })
  }

  private buttonHandler = (e: MouseEvent, entity: Entity, value: LifecycleValue): void => {
    if (!this._mouse || this._mouse.getComponent(MouseInput).actionMap[e.button] === undefined) return
    entity.getMutableComponent(InputActionHandler).queue.add({
      action: this._mouse.getComponent(MouseInput).actionMap[e.button],
      value: value
    })
  }
}

MouseInputSystem.queries = {
  buttons: {
    components: [MouseInput, InputActionHandler, UserInput],
    listen: {
      added: true,
      removed: true
    }
  },
  axis: {
    components: [MouseInput, InputAxisHandler2D, UserInput],
    listen: {
      added: true,
      removed: true
    }
  }
}
