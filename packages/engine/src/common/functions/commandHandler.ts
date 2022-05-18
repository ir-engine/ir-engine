import { Vector2, Vector3 } from 'three'

import { UserId } from '@xrengine/common/src/interfaces/UserId'

import { Entity } from '../../ecs/classes/Entity'
import { addComponent, getComponent } from '../../ecs/functions/ComponentFunctions'
import { LocalInputTagComponent } from '../../input/components/LocalInputTagComponent'
import { AutoPilotClickRequestComponent } from '../../navigation/component/AutoPilotClickRequestComponent'
import { AutoPilotOverrideComponent } from '../../navigation/component/AutoPilotOverrideComponent'

//The values the commands that must have in the start
export const commandStarters = ['/', '//']

//Checks if a text (string) is a command
export function isCommand(text: string): boolean {
  for (let i = 0; i < commandStarters.length; i++) {
    if (text.startsWith(commandStarters[i])) return true
  }

  return false
}

/**
 * Handles a command, the input is sent both from server and client, each one can handle it differently
 * The return value is boolean (true/false), if it returns true the caller function will terminate, otherwise it will continue
 * First it is called in the server and then in the client
 * The entity in the server is the UserId, while in the client is the EntityId
 * @author Alex Titonis
 */
export function handleCommand(cmd: string, entity: Entity, userId: UserId): boolean {
  //It checks for all messages, the default
  if (!isCommand(cmd)) return false

  return true
}

export function goTo(pos: Vector3, entity: Entity) {
  let linput = getComponent(entity, LocalInputTagComponent)
  if (linput === undefined) linput = addComponent(entity, LocalInputTagComponent, {})
  addComponent(entity, AutoPilotOverrideComponent, {
    overrideCoords: true,
    overridePosition: pos
  })
  addComponent(entity, AutoPilotClickRequestComponent, {
    coords: new Vector2(0.01, 0.01)
  })
}
