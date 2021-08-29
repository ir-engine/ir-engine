import { getComponent, addComponent } from '../../../engine/src/ecs/functions/EntityFunctions'
import { Vector2, Vector3 } from 'three'
import { AutoPilotClickRequestComponent } from '../../../engine/src/navigation/component/AutoPilotClickRequestComponent'
import { LocalInputTagComponent } from '../../../engine/src/input/components/LocalInputTagComponent'
import { TransformComponent } from '../../../engine/src/transform/components/TransformComponent'
import { WorldScene } from '../../../engine/src/scene/functions/SceneLoading'
import { Engine } from '../../../engine/src/ecs/classes/Engine'
import { isBot } from '../../../engine/src/common/functions/isBot'

//The values the commands that must have in the start
export const commandStarters = ['/', '//']

//Checks if a text (string) is a command
export function isCommand(text: string): boolean {
  for (var i = 0; i < commandStarters.length; i++) {
    if (text.startsWith(commandStarters[i])) return true
  }

  return false
}
//Get the count of the command init value
export function getStarterCount(text: string): number {
  for (var i = 0; i < commandStarters.length; i++) {
    if (text.startsWith(commandStarters[i])) return commandStarters[i].length
  }

  return 0
}

/**
 * Handles a command, the input is sent both from server and client, each one can handle it differently
 * The return value is boolean (true/false), if it returns true the caller function will terminate, otherwise it will continue
 * First it is called in the server and then in the client
 * The eid in the server is the UserId, while in the client is the EntityId
 * @author Alex Titonis
 */
export function handleCommand(cmd: string, eid: any, isServer: boolean): boolean {
  //It checks for all messages, the default
  if (!isCommand(cmd)) return false

  //Remove the command starter, get the data (the base which is the command and the parameters if exist, parameters are separated by , (commas))
  cmd = cmd.substring(getStarterCount(cmd))
  var data = cmd.split(' ')
  var base = data[0]
  var params = data.length == 2 ? data[1].split(',') : ''

  //Handle the command according to the base
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
        handleMoveCommand(x, y, z, eid)
      }

      if (!isServer) return true
      else return false
    case 'metadata': {
      //This command is handled only in the client and only if the caller is a bot
      if (isServer) return false
      if (!Engine.isBot && !isBot(window)) return true

      //The params must either be 1 or 2, if it is scene, then 1 other wise 2 - world, max distance
      if (params.length > 0) {
        if (params[0] === 'world' && params.length != 2) {
          console.log('invalid params, available params, scene or world,distance (float)')
          return true
        }
      } else return true

      handleMetadataCommand(params, eid)

      return true
    }
    default:
      console.log('unknown command: ' + base + ' params: ' + (params === '' ? 'none' : params))

      if (!isServer) return true
      else return false
  }
}

//Create fake input on the map (like left click) with the coordinates written and implement the auto pilot click request component to the player
function handleMoveCommand(x: number, y: number, z: number, eid: any) {
  var linput = getComponent(eid, LocalInputTagComponent)
  if (linput === undefined) linput = addComponent(eid, LocalInputTagComponent, {})
  addComponent(eid, AutoPilotClickRequestComponent, { coords: new Vector2(x, y) })
}

function handleMetadataCommand(params: any, eid: any) {
  if (params[0] === 'scene') {
    console.log('scene_metadata|' + WorldScene.sceneMetadata)
  } else {
    const position = getComponent(eid, TransformComponent).position
    const maxDistance: number = parseFloat(params[1])
    var _data
    var x,
      y,
      z: number = 0
    var vector: Vector3
    var distance: number = 0

    for (let i in WorldScene.worldMetadata) {
      _data = WorldScene.worldMetadata[i].key.split(',')
      if (_data.length !== 3) continue

      x = parseFloat(_data[0])
      y = parseFloat(_data[1])
      z = parseFloat(_data[2])
      vector = new Vector3(x, y, z)

      distance = position.distanceTo(vector)
      if (distance > maxDistance) continue
      else console.log('metadata|' + x + ',' + y + ',' + z + '|' + WorldScene.worldMetadata[i].value)
    }
  }
}
