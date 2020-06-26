// TODO: Fill out VR and touchscreen

import KeyboardInput from "../components/KeyboardInput"
import MouseInput from "../components/MouseInput"
import { System } from "ecsy"
import ActionReceiver from "../components/ActionReceiver"

export default class ActionSystem extends System {
  execute() {
    const actions = [] // TODO: Convert to ringbuffer

    this.queries.vr.results.forEach(entity => {
      // Get input
      // Map input to action
      // Add action to array
    })

    this.queries.mouse.results.forEach(entity => {
      // Get input
      // Map input to action
      // Add action to array
    })

    this.queries.keyboard.results.forEach(entity => {
      // Get input
      // Map input to action
      // Add action to array
    })
  }
}

ActionSystem.queries = {
  /*vr: {
    components: [ VRInputState ]
  },
  */
  mouse: {
    components: [MouseInput]
  },
  keyboard: {
    components: [KeyboardInput]
  },
  /*
  touchscreen: {
    components: [TouchscreenInputState]
  },
  */
  receivers: {
    components: [ActionReceiver]
  }
}
