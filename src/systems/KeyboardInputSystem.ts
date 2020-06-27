import { System } from "ecsy"
import KeyboardInput from "../components/KeyboardInput"
import ButtonAction from "../enums/ButtonAction"

export default class KeyboardInputSystem extends System {
  kb: any

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  execute(): void {
    this.queries.keyboard.added.forEach(entity => {
      document.addEventListener("keydown", (e: KeyboardEvent) => {
        this.setKeyState(e.key, ButtonAction.PRESSED)
      })
      document.addEventListener("keyup", (e: KeyboardEvent) => {
        this.setKeyState(e.key, ButtonAction.RELEASED)
      })
    })
    this.queries.keyboard.results.forEach(entity => {
      if (!this.kb) this.kb = entity.getComponent(KeyboardInput)
    })
    this.queries.keyboard.removed.forEach(entity => {
      this.kb = entity.getComponent(KeyboardInput)
      document.removeEventListener("keydown", (e: KeyboardEvent) => {
        this.setKeyState(e.key, ButtonAction.PRESSED)
      })
      document.removeEventListener("keyup", (e: KeyboardEvent) => {
        this.setKeyState(e.key, ButtonAction.RELEASED)
      })
    })
  }

  setKeyState(key: string, value: ButtonAction): any {
    if(!this.kb) return
    console.log(this.kb.keys)
    if (!this.kb.keys[key]) {
      this.kb.keys[key] = {
        prev: ButtonAction.RELEASED,
        current: ButtonAction.RELEASED,
        changed: false
      }
    }
    this.kb.keys[key].prev = this.kb.keys[key].current
    this.kb.keys[key].current = value
    this.kb.keys[key].changed = true
  }
}

KeyboardInputSystem.queries = {
  keyboard: {
    components: [KeyboardInput],
    listen: { added: true, removed: true }
  }
}
