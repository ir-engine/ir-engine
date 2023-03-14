import { Engine } from '../../ecs/classes/Engine'

export default async function ButtonSystem() {
  return {
    execute: () => {
      const hasFocus = document.hasFocus()
      for (const key in Engine.instance.buttons) {
        const button = Engine.instance.buttons[key]
        if (button.down) button.down = false
        if (button.up || !hasFocus) delete Engine.instance.buttons[key]
      }
    },
    cleanup: async () => {}
  }
}
