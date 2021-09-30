import { defineQuery } from 'bitecs'
import { Network } from '@xrengine/engine/src/networking/classes/Network'
import { TransformComponent } from '@xrengine/engine/src/transform/components/TransformComponent'
import { forwardVector3, multiplyQuaternion, normalize, subVector } from '@xrengine/common/src/utils/mathUtils'
import { getUserId, getPlayerName } from '@xrengine/engine/src/networking/utils/getUser'
import { System } from '@xrengine/engine/src/ecs/classes/System'
import { World } from '@xrengine/engine/src/ecs/classes/World'
import { hasComponent, getComponent, addComponent } from '@xrengine/engine/src/ecs/functions/ComponentFunctions'
import { isEntityLocalClient } from '@xrengine/engine/src/networking/functions/isEntityLocalClient'
import { ProximityComponent } from '../components/ProximityComponent'
import { ChatService } from '../../social/reducers/chat/ChatService'
import { accessAuthState } from '../../user/reducers/auth/AuthState'
import { NameComponent } from '@xrengine/engine/src/scene/components/NameComponent'

const maxDistance: number = 10
const intimateDistance: number = 5
const harassmentDistance: number = 1

export default async function ProximitySystem(world: World): Promise<System> {
  const proximityCheckerQuery = defineQuery([TransformComponent, ProximityComponent])

  return () => {
    for (const eid of proximityCheckerQuery(world)) {
      if (isEntityLocalClient(eid)) {
        const { usersInRange, usersInIntimateRange, usersInHarassmentRange, usersLookingTowards } = getComponent(
          eid,
          ProximityComponent
        )
        const _usersInRange: any[] = []
        const _usersInIntimateRange: any = []
        const _usersInHarassmentRange: any = []
        const _usersLookingTowards: any[] = []
        const userId = getUserId(eid)
        const transform = getComponent(eid, TransformComponent)
        let remoteTransform
        let distance: number = -1
        let dot: number = -1

        for (const id in Network.instance.networkObjects) {
          const object = Network.instance.networkObjects[id]
          if (!object || object.uniqueId === userId) continue
          const { name } = getComponent(object.entity, NameComponent)

          remoteTransform = getComponent(object.entity, TransformComponent)
          if (remoteTransform === undefined) continue

          distance = transform.position.distanceTo(remoteTransform.position)
          if (distance > 0 && distance <= maxDistance && distance > intimateDistance) {
            if (!_usersInRange.includes(object.entity)) {
              if (_usersInIntimateRange.includes(object.entity))
                _usersInIntimateRange.slice(_usersInIntimateRange.indexOf(object.entity), 1)
              if (_usersInHarassmentRange.includes(object.entity))
                _usersInHarassmentRange.slice(_usersInHarassmentRange.indexOf(object.entity), 1)

              _usersInRange.push(object.entity)
              if (!usersInRange.includes(object.entity)) {
                sendProximityChatMessage(name + ' in range with ' + getPlayerName(eid))
                console.log('proximity|inRange|' + name + '|' + distance)
              }
            }
          } else if (distance > 0 && distance <= intimateDistance && distance > harassmentDistance) {
            if (!_usersInIntimateRange.includes(object.entity)) {
              if (_usersInRange.includes(object.entity)) _usersInRange.splice(_usersInRange.indexOf(object.entity), 1)
              if (_usersInHarassmentRange.includes(object.entity))
                _usersInHarassmentRange.splice(_usersInHarassmentRange.indexOf(object.entity), 1)

              _usersInIntimateRange.push(object.entity)
              if (!usersInIntimateRange.includes(object.entity)) {
                sendProximityChatMessage(name + ' in intimage range with ' + getPlayerName(eid))
                console.log('proximity|intimate|' + name + '|' + distance)
              }
            }
          } else if (distance > 0 && distance <= harassmentDistance) {
            if (!_usersInHarassmentRange.includes(object.entity)) {
              if (_usersInRange.includes(object.entity)) _usersInRange.splice(_usersInRange.indexOf(object.entity), 1)
              if (_usersInIntimateRange.includes(object.entity))
                _usersInIntimateRange.slice(_usersInIntimateRange.indexOf(object.entity), 1)

              _usersInHarassmentRange.push(object.entity)
              if (!usersInHarassmentRange.includes(object.entity)) {
                sendProximityChatMessage(name + ' in harassment range with ' + getPlayerName(eid))
                console.log('proximity|harassment|' + name + '|' + distance)
              }
            }
          }

          const forward = multiplyQuaternion(transform.rotation, forwardVector3)
          const toOther = normalize(subVector(remoteTransform.position, transform.position))
          dot = forward.dot(toOther)
          if (dot >= 0.7) {
            if (!_usersLookingTowards.includes(object.entity)) {
              _usersLookingTowards.push(object.entity)
              if (!usersLookingTowards.includes(object.entity)) {
                sendProximityChatMessage(name + ' looking at ' + getPlayerName(eid))
                console.log('proximity|lookAt|' + name + '|' + dot)
              }
            }
          }

          for (let i = 0; i < usersInRange.length; i++) {
            if (!_usersInRange.includes(usersInRange[i]) && !_usersInIntimateRange.includes(usersInRange[i])) {
              sendProximityChatMessage(name + ' not in range with ' + getPlayerName(eid))
              console.log('proximity|inRange|' + name + '|left')
            }
          }
          for (let i = 0; i < usersInIntimateRange.length; i++) {
            if (!_usersInIntimateRange.includes(usersInIntimateRange[i])) {
              sendProximityChatMessage(name + ' not in intimate range with ' + getPlayerName(eid))
              console.log('proximity|intimate|' + name + '|left')
            }
          }
          for (let i = 0; i < usersInHarassmentRange.length; i++) {
            if (!_usersInHarassmentRange.includes(usersInHarassmentRange[i])) {
              sendProximityChatMessage(name + ' not in harassment range with ' + getPlayerName(eid))
              console.log('proximity|harassment|' + name + '|left')
            }
          }
          for (let i = 0; i < usersLookingTowards.length; i++) {
            if (!_usersLookingTowards.includes(usersLookingTowards[i])) {
              sendProximityChatMessage(name + ' not looking at ' + getPlayerName(eid))
              console.log('proximity|lookAt|' + name + '|left')
            }
          }

          getComponent(eid, ProximityComponent).usersInRange = _usersInRange
          getComponent(eid, ProximityComponent).usersInIntimateRange = _usersInIntimateRange
          getComponent(eid, ProximityComponent).usersInHarassmentRange = _usersInHarassmentRange
          getComponent(eid, ProximityComponent).usersLookingTowards = _usersLookingTowards
        }
      }
    }
  }
}

function sendProximityChatMessage(text) {
  const user = accessAuthState().user.value
  ChatService.sendChatMessage({
    targetObjectId: user.instanceId,
    targetObjectType: 'instance',
    text: '[proximity]' + text
  })
}
