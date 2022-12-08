import { World } from '../../ecs/classes/World'

export default async function ButtonSystem(world: World) {
  return {
    execute: () => {
      for (const key in world.buttons) {
        const button = world.buttons[key]
        if (button.down) button.down = false
        if (button.up) delete world.buttons[key]
      }
    },
    cleanup: async () => {}
  }
}
