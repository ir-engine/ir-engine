import { System, Entity } from "ecsy"
import MouseInput from "../components/MouseInput"
import Switch from "../enums/Switch"
import InputActionHandler from "../components/InputActionHandler"
import UserInput from "../components/UserInput"
import InputAxisHandler2D from "../components/InputAxisHandler2D"
import { enableScroll, disableScroll } from "../utils/EnableDisableScrolling"

export default class MouseInputSystem extends System {
  // Temp variables
  private _mouse: Entity
  public execute(): void {
    this.queries.axis.added.forEach(ent => {
      this._mouse = ent
      document.addEventListener("mousemove", e => (this._mouse.getMutableComponent(MouseInput).moveHandler = this.moveHandler(e, ent)), false)
    })
    this.queries.buttons.added.forEach(ent => {
      this._mouse = ent
      document.addEventListener("contextmenu", event => event.preventDefault())
      disableScroll()
      document.addEventListener(
        "mousedown",
        e => (this._mouse.getMutableComponent(MouseInput).downHandler = this.buttonHandler(e, ent, Switch.ON)),
        false
      )
      document.addEventListener(
        "mouseup",
        e => (this._mouse.getMutableComponent(MouseInput).upHandler = this.buttonHandler(e, ent, Switch.OFF)),
        false
      )
    })
    this.queries.axis.removed.forEach(() => {
      if (this._mouse) document.removeEventListener("mousemove", this._mouse.getMutableComponent(MouseInput).moveHandler)
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
    entity.getComponent(InputAxisHandler2D).values.add({
      axis: this._mouse.getComponent(UserInput).inputMap.mouse.axes.mousePosition,
      value: { x: (e.clientX / window.innerWidth) * 2 - 1, y: (e.clientY / window.innerHeight) * 2 + 1 }
    })
  }

  private buttonHandler = (e: MouseEvent, entity: Entity, value: Switch): void => {
    if (!this._mouse || this._mouse.getComponent(UserInput).inputMap.mouse.actions[e.button] === undefined) return
    entity.getMutableComponent(InputActionHandler).values.add({
      action: this._mouse.getComponent(UserInput).inputMap.mouse.actions[e.button],
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
