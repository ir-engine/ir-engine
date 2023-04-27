import { Engine } from '../../ecs/classes/Engine'
import { defineQuery, getComponent } from '../../ecs/functions/ComponentFunctions'
import { defineSystem } from '../../ecs/functions/SystemFunctions'
import { InputSourceComponent } from '../components/InputSourceComponent'
import { OldButtonInputStateType } from '../InputState'

const inputSources = defineQuery([InputSourceComponent])

function cleanupButton(key: string, buttons: OldButtonInputStateType, hasFocus: boolean) {
  const button = buttons[key]
  if (button.down) button.down = false
  if (button.up || !hasFocus) delete buttons[key]
}

const execute = () => {
  const hasFocus = document.hasFocus()

  for (const key in Engine.instance.buttons) {
    cleanupButton(key, Engine.instance.buttons, hasFocus)
  }

  for (const eid of inputSources()) {
    const source = getComponent(eid, InputSourceComponent)
    for (const key in source.buttons) {
      cleanupButton(key, Engine.instance.buttons, hasFocus)
    }
  }
}

export const ButtonCleanupSystem = defineSystem({
  uuid: 'ee.engine.input.ButtonCleanupSystem',
  execute
})
