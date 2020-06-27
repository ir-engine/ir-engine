// TODO: Replace keyboard state strings with enums
import { System } from "ecsy"
import Input from "../components/Input"
import KeyboardInput from "../components/KeyboardInput"
import ButtonState from "../enums/ButtonState"

export default class KeyboardInputSystem extends System {
  kb: any
  inp: any

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  execute(): void {
    this.queries.keyboard.added.forEach(() => {
      document.addEventListener("keydown", (e: KeyboardEvent) => {
        this.setKeyState(this.kb, e.key, ButtonState.PRESSED)
      })
      document.addEventListener("keyup", (e: KeyboardEvent) => {
        this.setKeyState(this.kb, e.key, ButtonState.RELEASED)
      })
    })
    this.queries.keyboard.results.forEach(ent => {
      if (!this.kb) this.kb = ent.getComponent(KeyboardInput)
      if (!this.inp) this.inp = ent.getMutableComponent(Input)
      Object.keys(this.kb.mapping).forEach(key => {
        const name = this.kb.mapping[key]
        const state = this.getKeyState(this.kb, key)
        if (
          state.current === ButtonState.PRESSED &&
          state.prev === ButtonState.RELEASED
        ) {
          this.inp.states[name] = state.current === ButtonState.PRESSED
          this.inp.changed = true
        }
        if (
          state.current === ButtonState.RELEASED &&
          state.prev === ButtonState.PRESSED
        ) {
          this.inp.states[name] = state.current === ButtonState.PRESSED
          this.inp.changed = true
          this.inp.released = true
        }
        state.prev = state.current
      })
    })
  }

  setKeyState(kb: KeyboardInput, key: string, value: ButtonState): any {
    const state = this.getKeyState(kb, key)
    state.prev = state.current
    state.current = value
  }

  getKeyState(kb: KeyboardInput, key: string): any {
    if (!kb.keys[key]) {
      kb.keys[key] = {
        prev: ButtonState.RELEASED,
        current: ButtonState.RELEASED
      }
    }
    return kb.keys[key]
  }
  isPressed(kb: KeyboardInput, name: string): boolean {
    return this.getKeyState(kb, name).current === ButtonState.PRESSED
  }
}

KeyboardInputSystem.queries = {
  keyboard: {
    components: [KeyboardInput, Input],
    listen: { added: true, removed: true }
  }
}
