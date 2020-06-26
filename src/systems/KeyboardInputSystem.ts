// TODO: Replace keyboard state strings with enums
import { System } from "ecsy"
import { Input } from "../components/Input"
import { KeyboardInput } from "../components/KeyboardInput"

export class KeyboardInputSystem extends System {
  debug: boolean
  kb: any
  inp: any

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  execute(delta: number, time: number): void {
    this.queries.controls.added.forEach(() => {
      if (window && (window as any).DEBUG_INPUT) {
        this.debug = (window as any).DEBUG_INPUT
      } else this.debug = false
      document.addEventListener("keydown", (e: any) => {
        this.setKeyState(this.kb, e.key, "down")
      })
      document.addEventListener("keyup", (e: any) => {
        this.setKeyState(this.kb, e.key, "up")
      })
    })
    this.queries.controls.results.forEach(ent => {
      if (!this.kb) this.kb = ent.getComponent(KeyboardInput)
      if (!this.inp) this.inp = ent.getMutableComponent(Input)
      Object.keys(this.kb.mapping).forEach(key => {
        const name = this.kb.mapping[key]
        const state = this.getKeyState(this.kb, key)
        if (state.current === "down" && state.prev === "up") {
          this.inp.states[name] = state.current === "down"
          this.inp.changed = true
        }
        if (state.current === "up" && state.prev === "down") {
          this.inp.states[name] = state.current === "down"
          this.inp.changed = true
          this.inp.released = true
        }
        state.prev = state.current
      })
    })
  }

  setKeyState(kb: KeyboardInput, key: string, value: string): any {
    const state = this.getKeyState(kb, key)
    state.prev = state.current
    state.current = value
    if (this.debug) console.log(`Set ${key} to ${value}`)
  }
  getKeyState(kb: KeyboardInput, key: string): any {
    if (!kb.states[key]) {
      kb.states[key] = {
        prev: "up",
        current: "up"
      }
    }
    return kb.states[key]
  }
  isPressed(kb: KeyboardInput, name: string): boolean {
    return this.getKeyState(kb, name).current === "down"
  }
}

KeyboardInputSystem.queries = {
  controls: {
    components: [KeyboardInput, Input],
    listen: { added: true, removed: true }
  }
}
