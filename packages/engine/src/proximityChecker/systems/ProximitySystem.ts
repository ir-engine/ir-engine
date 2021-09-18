import { defineQuery, defineSystem } from 'bitecs'
import { Network } from '../../networking/classes/Network'
import { TransformComponent } from '../../transform/components/TransformComponent'
import { forwardVector3, multiplyQuaternion, normalize, subVector } from '@xrengine/common/src/utils/mathUtils'
import { getUserId } from '../../networking/utils/getUser'
import { World } from '../../ecs/classes/World'
import { System } from '../../ecs/classes/System'
import { getComponent } from '../../ecs/functions/ComponentFunctions'
import { isEntityLocalClient } from '../../networking/functions/isEntityLocalClient'
import { ProximityComponent } from '../components/ProximityComponent '

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
              if (!usersInRange.includes(object.entity))
                console.log('proximity|inRange|' + object.entity + '|' + distance)
            }
          } else if (distance > 0 && distance <= intimateDistance && distance > harassmentDistance) {
            if (!_usersInIntimateRange.includes(object.entity)) {
              if (_usersInRange.includes(object.entity)) _usersInRange.splice(_usersInRange.indexOf(object.entity), 1)
              if (_usersInHarassmentRange.includes(object.entity))
                _usersInHarassmentRange.splice(_usersInHarassmentRange.indexOf(object.entity), 1)

              _usersInIntimateRange.push(object.entity)
              if (!usersInIntimateRange.includes(object.entity))
                console.log('proximity|intimate|' + object.entity + '|' + distance)
            }
          } else if (distance > 0 && distance <= harassmentDistance) {
            if (!_usersInHarassmentRange.includes(object.entity)) {
              if (_usersInRange.includes(object.entity)) _usersInRange.splice(_usersInRange.indexOf(object.entity), 1)
              if (_usersInIntimateRange.includes(object.entity))
                _usersInIntimateRange.slice(_usersInIntimateRange.indexOf(object.entity), 1)

              _usersInHarassmentRange.push(object.entity)
              if (!usersInHarassmentRange.includes(object.entity))
                console.log('proximity|harassment|' + object.entity + '|' + distance)
            }
          }

          const forward = multiplyQuaternion(transform.rotation, forwardVector3)
          const toOther = normalize(subVector(remoteTransform.position, transform.position))
          dot = forward.dot(toOther)
          if (dot >= 0.7) {
            if (!_usersLookingTowards.includes(object.entity)) {
              _usersLookingTowards.push(object.entity)
              if (!usersLookingTowards.includes(object.entity))
                console.log('proximity|lookAt|' + object.entity + '|' + dot)
            }
          }

          for (let i = 0; i < usersInRange.length; i++) {
            if (!_usersInRange.includes(usersInRange[i]) && !_usersInIntimateRange.includes(usersInRange[i])) {
              console.log('proximity|inRange|' + object.entity + '|left')
            }
          }
          for (let i = 0; i < usersInIntimateRange.length; i++) {
            if (!_usersInIntimateRange.includes(usersInIntimateRange[i])) {
              console.log('proximity|intimate|' + object.entity + '|left')
            }
          }
          for (let i = 0; i < usersInHarassmentRange.length; i++) {
            if (!_usersInHarassmentRange.includes(usersInHarassmentRange[i])) {
              console.log('proximity|harassment|' + object.entity + '|left')
            }
          }
          for (let i = 0; i < usersLookingTowards.length; i++) {
            if (!_usersLookingTowards.includes(usersLookingTowards[i])) {
              console.log('proximity|lookAt|' + object.entity + '|left')
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
