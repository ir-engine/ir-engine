import { defineQuery, defineSystem, enterQuery, exitQuery, System } from 'bitecs'
import { ECSWorld } from '../../ecs/classes/World'
import { getComponent } from '../../ecs/functions/EntityFunctions'
import { Network } from '../../networking/classes/Network'
import { TransformComponent } from '../../transform/components/TransformComponent'
import { ProximityComponent } from '../components/ProximityComponent'
import { forwardVector3, multiplyQuaternion, normalize, subVector } from '@xrengine/common/src/utils/mathUtils'
import { isEntityLocal } from '../../networking/utils/isPlayerLocal'
import { getUserId } from '../../networking/utils/getUser'

const maxDistance: number = 10
const intimateDistance: number = 5
const harassmentDistance: number = 1

export const ProximitySystem = async (): Promise<System> => {
  const proximityCheckerQuery = defineQuery([TransformComponent, ProximityComponent])

  return defineSystem((world: ECSWorld) => {
    for (const eid of proximityCheckerQuery(world)) {
      if (isEntityLocal(eid)) {
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
                console.log('remote user id nearby with eid: ' + object.entity + ' distance: ' + distance)
            }
          } else if (distance > 0 && distance <= intimateDistance && distance > harassmentDistance) {
            if (!_usersInIntimateRange.includes(object.entity)) {
              if (_usersInRange.includes(object.entity)) _usersInRange.splice(_usersInRange.indexOf(object.entity), 1)
              if (_usersInHarassmentRange.includes(object.entity))
                _usersInHarassmentRange.splice(_usersInHarassmentRange.indexOf(object.entity), 1)

              _usersInIntimateRange.push(object.entity)
              if (!usersInIntimateRange.includes(object.entity))
                console.log('remote user id intimate distance with eid: ' + object.entity + ' distance: ' + distance)
            }
          } else if (distance > 0 && distance <= harassmentDistance) {
            if (!_usersInHarassmentRange.includes(object.entity)) {
              if (_usersInRange.includes(object.entity)) _usersInRange.splice(_usersInRange.indexOf(object.entity), 1)
              if (_usersInIntimateRange.includes(object.entity))
                _usersInIntimateRange.slice(_usersInIntimateRange.indexOf(object.entity), 1)

              _usersInHarassmentRange.push(object.entity)
              if (!usersInHarassmentRange.includes(object.entity))
                console.log('remote user id harassment distance with eid: ' + object.entity + ' distance: ' + distance)
            }
          }

          const forward = multiplyQuaternion(transform.rotation, forwardVector3)
          const toOther = normalize(subVector(remoteTransform.position, transform.position))
          dot = forward.dot(toOther)
          if (dot >= 0.7) {
            if (!_usersLookingTowards.includes(object.entity)) {
              _usersLookingTowards.push(object.entity)
              if (!usersLookingTowards.includes(object.entity))
                console.log('remote user id nearby with eid: ' + object.entity + ' dot: ' + dot)
            }
          }

          for (let i = 0; i < usersInRange.length; i++) {
            if (!_usersInRange.includes(usersInRange[i]) && !_usersInIntimateRange.includes(usersInRange[i])) {
              console.log('user not in range')
            }
          }
          for (let i = 0; i < usersInIntimateRange.length; i++) {
            if (!_usersInIntimateRange.includes(usersInIntimateRange[i])) {
              console.log('user not in intimate range')
            }
          }
          for (let i = 0; i < usersInHarassmentRange.length; i++) {
            if (!_usersInHarassmentRange.includes(usersInHarassmentRange[i])) {
              console.log('user not in harassment range')
            }
          }
          for (let i = 0; i < usersLookingTowards.length; i++) {
            if (!_usersLookingTowards.includes(usersLookingTowards[i])) {
              console.log('user not looking towards')
            }
          }

          getComponent(eid, ProximityComponent).usersInRange = _usersInRange
          getComponent(eid, ProximityComponent).usersInIntimateRange = _usersInIntimateRange
          getComponent(eid, ProximityComponent).usersInHarassmentRange = _usersInHarassmentRange
          getComponent(eid, ProximityComponent).usersLookingTowards = _usersLookingTowards
        }
      }
    }

    return world
  })
}
