import { System } from "ecsy"
import { InputState } from "../components/InputState"
import { KeyboardInputState } from "../components/KeyboardInputState"

export class KeyboardInputSystem extends System {
  queries = {
    controls: {
      components: [KeyboardInputState, InputState],
      listen: { added: true, removed: true },
      added: [],
      results: []
    }
  }
  set debug(debug: boolean) {
    this.debug = debug
  }

  kb: any
  inp: any

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  execute(delta: number, time: number): void {
    this.queries.controls.added.forEach(() => {
      document.addEventListener("keydown", this.on_keydown)
      document.addEventListener("keyup", this.on_keyup)
    })
    this.queries.controls.results.forEach(ent => {
      if (!this.kb) this.kb = ent.getComponent(KeyboardInputState)
      if (!this.inp) this.inp = ent.getMutableComponent(InputState)
      Object.keys(this.kb.mapping).forEach(key => {
        const name = this.kb.mapping[key]
        const state = this.kb.getKeyState(key)
        if (state.current === "down" && state.prev === "up") {
          this.inp.states[name] = state.current === "down"
          this.inp.changed = true
          console.log(name + " changed to " + state)
        }
        if (state.current === "up" && state.prev === "down") {
          this.inp.states[name] = state.current === "down"
          this.inp.changed = true
          this.inp.released = true
          console.log(name + " changed to " + state)
        }
        state.prev = state.current
      })
      console.log(
        "key mapping",
        this.kb.mapping["a"],
        this.kb.states["a"],
        "left state",
        this.inp.states["left"]
      )
    })
  }

  on_keydown = (e: any) => {
    console.log("on_keydown: " + e.key)
    this.setKeyState(e.key, "down")
  }

  on_keyup = (e: any) => {
    console.log("on_keyup: " + e.key)
    this.setKeyState(e.key, "up")
  }

  setKeyState(key: string, value: string): any {
    const state = this.getKeyState(key)
    state.prev = state.current
    state.current = value
  }

  isPressed(name: string): boolean {
    return this.getKeyState(name).current === "down"
  }

  getKeyState(key: string): any {
    if (!this.kb.states[key]) {
      this.kb.states[key] = {
        prev: "up",
        current: "up"
      }
    }
    return this.kb.states[key]
  }
}
