import { Entity } from '../../ecs/classes/Entity'
import { Commands } from '../enums/Commands'
import { CommandType } from '../interfaces/WorldState'
import { NetworkObjectUpdateType } from '../templates/NetworkObjectUpdates'
import { sendClientObjectUpdate } from './sendClientObjectUpdate'

export const executeCommands = (entity: Entity, commands: CommandType[]): void => {
  commands.forEach((command) => {
    switch (command.type) {
      case Commands.CHANGE_ANIMATION_STATE:
        sendClientObjectUpdate(entity, NetworkObjectUpdateType.AnimationUpdate, [], [command.args])
        break
      default:
        console.warn('Command not supported')
    }
  })
}
