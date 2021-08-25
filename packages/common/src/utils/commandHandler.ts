import { getComponent, addComponent } from '../../../engine/src/ecs/functions/EntityFunctions'
import { Vector2 } from 'three'
import { InputComponent } from '../../../engine/src/input/components/InputComponent'
import { BaseInput } from '../../../engine/src/input/enums/BaseInput'
import { AutoPilotClickRequestComponent } from '../../../engine/src/navigation/component/AutoPilotClickRequestComponent'
import { AvatarInputSchema } from '../../../engine/src/avatar/AvatarInputSchema'
import { Dispatch } from 'redux'
import { BotAction } from '../../../bot/src/bot-action'
import Command from '../../../engine/src/editor/commands/Command'
import {
  AutoPilotComponent,
  createAutoPilotComponent
} from '../../../engine/src/navigation/component/AutoPilotComponent'
import { createTransformComponent } from '../../../engine/src/scene/functions/createTransformComponent'

/**
 * @author Alex Titonis
 */
export function handleCommand(cmd: string, userId: number, isServer: boolean) {
  if (!cmd.startsWith('/')) return false

  cmd = cmd.substring(1)
  var data = cmd.split(' ')
  var base = data[0]
  var params = data.length == 2 ? data[1].split(',') : ''

  switch (base) {
    case 'move':
      if (params.length < 3) {
        console.log('invalid move command - params length (' + params.length + ') ' + params)
        return true
      }

      const x = parseFloat(params[0])
      const y = parseFloat(params[1])
      const z = parseFloat(params[2])

      if (x === undefined || y === undefined || z === undefined) {
        console.log('invalid move command - params: ' + params)
        return true
      }

      if (!isServer) {
        console.log('handling movement cmd')
        handleMoveCommand(x, y, z, userId)
      }

      if (!isServer) return true
      else return false
    default:
      console.log('uknown command: ' + base + ' params: ' + (params === '' ? 'none' : params))

      if (!isServer) return true
      else return false
  }
}

function handleMoveCommand(x: number, y: number, z: number, userId: any) {
  var autoPilot = getComponent(userId, AutoPilotComponent)
  if (autoPilot === undefined) autoPilot = createAutoPilotComponent(userId, x, y, z)
  console.log(autoPilot)
}
