import { Vector3, Vector2 } from 'three'
import { AnimationGraph } from '../../avatar/animations/AnimationGraph'
import { AvatarAnimations, AvatarStates } from '../../avatar/animations/Util'
import { AvatarAnimationComponent } from '../../avatar/components/AvatarAnimationComponent'
import { getComponent, hasComponent, addComponent } from '../../ecs/functions/ComponentFunctions'
import { LocalInputTagComponent } from '../../input/components/LocalInputTagComponent'
import { AutoPilotClickRequestComponent } from '../../navigation/component/AutoPilotClickRequestComponent'
import { AutoPilotComponent } from '../../navigation/component/AutoPilotComponent'
import { removeFollowComponent, createFollowComponent } from '../../navigation/component/FollowComponent'
import { stopAutopilot } from '../../navigation/functions/stopAutopilot'
import {
  subscribeToChatSystem,
  unsubscribeFromChatSystem,
  getSubscribedChatSystems,
  removeMessageSystem
} from '../../networking/utils/chatSystem'
import { getRemoteUsers, getUserEntityByName } from '../../networking/utils/getUser'
import { TransformComponent } from '../../transform/components/TransformComponent'
import { isNumber } from '@xrengine/common/src/utils/miscUtils'
import { AutoPilotOverrideComponent } from '../../navigation/component/AutoPilotOverrideComponent'
import { isBot } from './isBot'
import { Engine } from '../../ecs/classes/Engine'
// import { accessChatState } from '@xrengine/client-core/src/social/services/ChatService'
import { Entity } from '../../ecs/classes/Entity'
import { UserId } from '@xrengine/common/src/interfaces/UserId'

//The values the commands that must have in the start
export const commandStarters = ['/', '//']

//Checks if a text (string) is a command
export function isCommand(text: string): boolean {
  for (let i = 0; i < commandStarters.length; i++) {
    if (text.startsWith(commandStarters[i])) return true
  }

  return false
}
//Get the count of the command init value
export function getStarterCount(text: string): number {
  for (let i = 0; i < commandStarters.length; i++) {
    if (text.startsWith(commandStarters[i])) return commandStarters[i].length
  }

  return 0
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

  //Remove the command starter, get the data (the base which is the command and the parameters if exist, parameters are separated by , (commas))
  cmd = cmd.substring(getStarterCount(cmd))
  let data = cmd.split(' ')
  let base = data[0]
  let params: string[] = [] // data.length >= 2 ? data[1].split(',') : []
  if (data.length > 1) {
    for (let i = 1; i < data.length; i++) {
      const d = data[i].split(',')
      for (let k = 0; k < d.length; k++) {
        params.push(d[k])
      }
    }
  }

  //Handle the command according to the base
  switch (base) {
    case 'move': {
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

      handleMoveCommand(x, y, z, entity)

      return false
    }
    case 'metadata': {
      //This command is handled only in the client and only if the caller is a bot
      if (!Engine.isBot && !isBot(window)) return true

      //The params must either be 1 or 2, if it is scene, then 1 other wise 2 - world, max distance
      if (params.length > 0) {
        if (params[0] === 'world' && params.length != 2) {
          console.log('invalid params, available params, scene or world,distance (float)')
          return true
        }
      } else return true

      handleMetadataCommand(params, entity)

      return true
    }
    case 'goTo': {
      if (!Engine.isBot && !isBot(window)) return true

      if (params.length != 1) {
        console.log('invalid params, it should be /goTo landmark')
        return true
      }

      handleGoToCommand(params[0], entity)

      return true
    }
    case 'emote': {
      if (params.length !== 1) {
        console.log('invalid params, it should be /emote emote_name')
        return true
      }

      handleEmoteCommand(params[0], entity)

      return true
    }
    case 'subscribe': {
      if (params.length !== 1) {
        console.log('invalid params, it should be /subscribe chat_system (emotions_system, all)')
        return true
      }

      handleSubscribeToChatSystemCommand(params[0], userId)

      return true
    }
    case 'unsubscribe': {
      if (params.length !== 1) {
        console.log('invalid params, it should be /unsubscribe chat_system (emotions_system all)')
        return true
      }

      handleUnsubscribeFromChatSystemCommand(params[0], userId)

      return true
    }
    case 'getSubscribed': {
      handleGetSubscribedChatSystemsCommand(userId)

      return true
    }
    case 'face': {
      if (params.length !== 1) {
        console.log('invalid params')
        return true
      }

      handleFaceCommand(params[0], entity)

      return true
    }
    case 'getPosition': {
      if (params.length !== 1) {
        console.log('invalid params')
        return true
      }

      handleGetPositionCommand(params[0], userId)

      return true
    }
    case 'getRotation': {
      if (params.length !== 1) {
        console.log('invalid params')
        return true
      }

      handleGetRotationCommand(params[0], userId)

      return true
    }
    case 'getScale': {
      if (params.length !== 1) {
        console.log('invalid params')
        return true
      }

      handleGetScaleCommand(params[0], userId)

      return true
    }
    case 'getTransform': {
      if (params.length !== 1) {
        console.log('invalid params')
        return true
      }

      handleGetTransformCommand(params[0], userId)

      return true
    }
    case 'follow': {
      let name = ''
      if (params.length < 1) {
        console.log('invalid params')
        return true
      } else if (params.length === 1) {
        name = params[0]
      } else {
        name = params.join(' ')
      }

      handleFollowCommand(name, entity, userId)

      return true
    }
    case 'getChatHistory': {
      handleGetChatHistoryCommand()

      return true
    }
    case 'listAllusers': {
      handleListAllUsersCommand(userId)

      return true
    }
    case 'getLocalUserId': {
      if (!isBot(window)) return false

      handleGetLocalUserIdCommand(userId)

      return true
    }
    default: {
      console.log('unknown command: ' + base + ' params: ' + params)
      return false
    }
  }
}

//Create fake input on the map (like left click) with the coordinates written and implement the auto pilot click request component to the player
function handleMoveCommand(x: number, y: number, z: number, entity: any) {
  goTo(new Vector3(x, y, z), entity)
  /*let linput = getComponent(entity, LocalInputTagComponent)
  if (linput === undefined) linput = addComponent(entity, LocalInputTagComponent, {})
  addComponent(entity, AutoPilotClickRequestComponent, { coords: new Vector2(x, z) })*/
}

function handleMetadataCommand(params: any, entity: any) {
  if (params[0] === 'scene') {
    console.log('scene_metadata|' + Engine.defaultWorld.sceneMetadata)
  } else {
    const position = getComponent(entity, TransformComponent).position
    const maxDistance: number = parseFloat(params[1])
    let vector: Vector3
    let distance: number = 0

    for (let i in Engine.defaultWorld.worldMetadata) {
      vector = getMetadataPosition(Engine.defaultWorld.worldMetadata[i])

      distance = position.distanceTo(vector)
      if (distance > maxDistance) continue
      else console.log('metadata|' + vector.x + ',' + vector.y + ',' + vector.z + '|' + i)
    }
  }
}

function handleGoToCommand(landmark: string, entity: any) {
  const position = getComponent(entity, TransformComponent).position
  let nearest: Vector3 = undefined!
  let distance: number = Number.MAX_SAFE_INTEGER
  let cDistance: number = 0
  let vector: Vector3

  for (let i in Engine.defaultWorld.worldMetadata) {
    if (i === landmark) {
      vector = getMetadataPosition(Engine.defaultWorld.worldMetadata[i])
      cDistance = position.distanceTo(vector)

      if (cDistance < distance) {
        distance = cDistance
        nearest = vector
      }
    }
  }

  console.log('goTo: ' + landmark + ' nearest: ' + JSON.stringify(nearest))
  if (nearest !== undefined) {
    goTo(nearest, entity)
  }
}

function handleEmoteCommand(emote: string, entity: any) {
  switch (emote) {
    case 'dance1':
      runAnimation(entity, AvatarStates.LOOPABLE_EMOTE, { animationName: AvatarAnimations.DANCING_1 })
      break
    case 'dance2':
      runAnimation(entity, AvatarStates.LOOPABLE_EMOTE, { animationName: AvatarAnimations.DANCING_2 })
      break
    case 'dance3':
      runAnimation(entity, AvatarStates.LOOPABLE_EMOTE, { animationName: AvatarAnimations.DANCING_3 })
      break
    case 'dance4':
      runAnimation(entity, AvatarStates.LOOPABLE_EMOTE, { animationName: AvatarAnimations.DANCING_4 })
      break
    case 'clap':
      runAnimation(entity, AvatarStates.EMOTE, { animationName: AvatarAnimations.CLAP })
      break
    case 'cry':
      runAnimation(entity, AvatarStates.EMOTE, { animationName: AvatarAnimations.CRY })
      break
    case 'laugh':
      runAnimation(entity, AvatarStates.EMOTE, { animationName: AvatarAnimations.LAUGH })
      break
    case 'sad':
      runAnimation(entity, AvatarStates.EMOTE, { animationName: AvatarAnimations.CRY })
      break
    case 'kiss':
      runAnimation(entity, AvatarStates.EMOTE, { animationName: AvatarAnimations.KISS })
      break
    case 'wave':
      runAnimation(entity, AvatarStates.EMOTE, { animationName: AvatarAnimations.WAVE })
      break
    default:
      console.log(
        'emote: ' + emote + ' not found, available: dance1, dance2, dance3, dance4, clap, cry, laugh, sad, kiss, wave'
      )
  }
}
function handleSubscribeToChatSystemCommand(system: string, userId: any) {
  subscribeToChatSystem(userId, system)
}
function handleUnsubscribeFromChatSystemCommand(system: string, userId: any) {
  unsubscribeFromChatSystem(userId, system)
}
async function handleGetSubscribedChatSystemsCommand(userId: any) {
  const systems: string[] = getSubscribedChatSystems(userId)
  console.log(systems)
}

function handleFaceCommand(face: string, entity: any) {
  if (face === undefined || face === '') return

  const faces = face.split(' ')
  if (faces.length == 0) return
  let time: number = 0
  if (faces.length > 1) {
    if (isNumber(faces[faces.length - 1])) {
      time = parseFloat(faces[faces.length - 1])
      faces.splice(faces.length - 1, 1)
    }
  }

  const _faces = []
  for (let i = 0; i < faces.length; i += 2) {
    const faceData = faces[i]
    const facePerc = faces[i + 1]
    _faces[faceData] = facePerc
  }

  //handle face
}

function handleGetPositionCommand(player: string, userId) {
  if (player === undefined || player === '') return

  const entity = getUserEntityByName(player, userId)
  if (entity === undefined) {
    console.log('undefiend entity')
    return
  }

  const transform = getComponent(entity, TransformComponent)
  if (transform === undefined) {
    console.log('undefined')
    return
  }

  console.log(player + ' position: ' + JSON.stringify(transform.position))
}

function handleGetRotationCommand(player: string, userid) {
  if (player === undefined || player === '') return

  const entity = getUserEntityByName(player, userid)
  if (entity === undefined) return

  const transform = getComponent(entity, TransformComponent)
  if (transform === undefined) return

  console.log(player + ' rotation: ' + JSON.stringify(transform.rotation))
}

function handleGetScaleCommand(player: string, userid) {
  if (player === undefined || player === '') return

  const entity = getUserEntityByName(player, userid)
  if (entity === undefined) return

  const transform = getComponent(entity, TransformComponent)
  if (transform === undefined) return

  console.log(player + ' scale: ' + JSON.stringify(transform.scale))
}

function handleGetTransformCommand(player: string, userid) {
  if (player === undefined || player === '') return

  const entity = getUserEntityByName(player, userid)
  if (entity === undefined) return

  const transform = getComponent(entity, TransformComponent)
  if (transform === undefined) return

  console.log(player + ' transform: ' + JSON.stringify(transform))
}
function handleFollowCommand(param: string, entity: Entity, userid) {
  if (param === 'stop') {
    removeFollowComponent(entity)
  } else {
    const targetEntity = getUserEntityByName(param, userid)
    console.log('follow target entity: ' + targetEntity)
    if (targetEntity === undefined || entity === targetEntity) return
    createFollowComponent(entity, targetEntity)
  }
}

function handleGetChatHistoryCommand() {
  // const chatState = accessChatState()
  // const channelState = chatState.channels
  // const channels = channelState.channels
  // const activeChannelMatch = Object.entries(channels).find(([, channel]) => channel.channelType === 'instance')
  // if (activeChannelMatch && activeChannelMatch.length > 0) {
  //   const activeChannel = activeChannelMatch[1]
  //   if (activeChannel === undefined) return
  //   const messages = activeChannel.messages
  //   if (messages === undefined) return
  //   for (let i = 0; i < messages.length; i++) messages[i].text = removeMessageSystem(messages[i].text)
  //   console.log('messages|' + JSON.stringify(messages))
  // } else {
  //   console.warn("Couldn't get chat state")
  // }
}

function handleListAllUsersCommand(userId) {
  console.log('listallusers, local id: ' + userId)
  if (userId === undefined) return

  const players = getRemoteUsers(userId, true)
  if (players === undefined) return

  const playerNames = players.map((userId) => Engine.defaultWorld.clients.get(userId)?.name)
  console.log('players|' + playerNames)
}
function handleGetLocalUserIdCommand(userId) {
  if (userId === undefined || userId === '') return

  console.log('localId|' + userId)
}

function runAnimation(entity: any, emote: string, emoteParams: any) {
  const aac = getComponent(entity, AvatarAnimationComponent)

  if (!aac.animationGraph.validateTransition(aac.currentState, aac.animationGraph.states[emote])) {
    console.warn('immediate transition to [%s] is not available from current state [%s]', emote, aac.currentState.name)
  }

  if (!hasComponent(entity, AutoPilotComponent)) AnimationGraph.forceUpdateAnimationState(entity, emote, emoteParams)
  else {
    stopAutopilot(entity)
    let interval = setInterval(() => {
      if (aac.animationGraph.validateTransition(aac.currentState, aac.animationGraph.states[emote])) {
        clearInterval(interval)
        AnimationGraph.forceUpdateAnimationState(entity, emote, emoteParams)
      }
    }, 50)
  }
}

function getMetadataPosition(_pos: string): Vector3 {
  if (_pos === undefined || _pos === '') return new Vector3(0, 0, 0)

  const _data = _pos.split(',')
  if (_data.length != 3) return new Vector3(0, 0, 0)

  const x = parseFloat(_data[0])
  const y = parseFloat(_data[1])
  const z = parseFloat(_data[2])

  return new Vector3(x, y, z)
}

export function goTo(pos: Vector3, entity: Entity) {
  let linput = getComponent(entity, LocalInputTagComponent)
  if (linput === undefined) linput = addComponent(entity, LocalInputTagComponent, {})
  addComponent(entity, AutoPilotOverrideComponent, {
    overrideCoords: true,
    overridePosition: pos
  })
  addComponent(entity, AutoPilotClickRequestComponent, {
    coords: new Vector2(0, 0)
  })
}
