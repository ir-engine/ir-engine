import { World } from '../../ecs/classes/World'

export default async function ButtonSystem(world: World) {
  return {
    execute: () => {
      const hasFocus = document.hasFocus()
      for (const key in world.buttons) {
        const button = world.buttons[key]
        if (button.down) button.down = false
        if (button.up || !hasFocus) delete world.buttons[key]
      }
    },
    cleanup: async () => {}
  }
}
