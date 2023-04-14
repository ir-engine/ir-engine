import { Engine } from '../../ecs/classes/Engine'
import { defineSystem, InputSystemGroup } from '../../ecs/functions/SystemFunctions'

const execute = () => {
  const hasFocus = document.hasFocus()
  for (const key in Engine.instance.buttons) {
    const button = Engine.instance.buttons[key]
    if (button.down) button.down = false
    if (button.up || !hasFocus) delete Engine.instance.buttons[key]
  }
}

export const ButtonCleanupSystem = defineSystem({
  uuid: 'ee.engine.input.ButtonCleanupSystem',
  execute
})
