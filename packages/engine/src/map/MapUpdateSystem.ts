import { defineQuery, defineSystem, enterQuery, System } from '../ecs/bitecs'
import { Vector3 } from 'three'
import { getCoord, getTile } from '.'
import { PI } from '../common/constants/MathConstants'
import { Engine } from '../ecs/classes/Engine'
import { ECSWorld } from '../ecs/classes/World'
import { getComponent } from '../ecs/functions/EntityFunctions'
import { Object3DComponent } from '../scene/components/Object3DComponent'
import { getCenterTile } from './MapBoxClient'
import { LocalInputReceiverComponent } from '../input/components/LocalInputReceiverComponent'
import { updateMap } from '../scene/behaviors/createMap'

export const MapUpdateSystem = async (): Promise<System> => {
  const moveQuery = defineQuery([Object3DComponent, LocalInputReceiverComponent])
  const moveAddQuery = enterQuery(moveQuery)
  let updateStatus = false
  let startAvatarPositionX
  let startAvatarPositionZ

  return defineSystem((world: ECSWorld) => {
    for (const entity of moveAddQuery(world)) {
      const position = getComponent(entity, Object3DComponent).value.position
      startAvatarPositionX = position.x
      startAvatarPositionZ = position.z
    }

    for (const entity of moveQuery(world)) {
      const position = getComponent(entity, Object3DComponent).value.position
      const centrCoord = getCoord()
      //Calculate new move coords
      const startLong = centrCoord[0]
      const startLat = centrCoord[1]

      const longtitude = (position.x - startAvatarPositionX) / 111134.861111 + startLong
      const latitude =
        (-position.z - startAvatarPositionZ) / (Math.cos((startLat * PI) / 180) * 111321.377778) + startLat

      //get Current Tile
      const startTile = getTile()
      const moveTile = getCenterTile([longtitude, latitude])

      if (updateStatus == false && moveTile[0] && startTile[0]) {
        if (startTile[0] == moveTile[0] && startTile[1] == moveTile[1]) {
          console.log('in center')
        } else {
          const remObj = Engine.scene.getObjectByName('MapObject')
          updateMap(
            entity,
            {
              scale: new Vector3(1, 1, 1)
            },
            longtitude,
            latitude,
            position
          )
          updateStatus = true
        }
      } else {
        if (startTile[0] == moveTile[0] && startTile[1] == moveTile[1]) {
          updateStatus = false
          console.log('sssssss')
        }
        console.log('Updating')
      }
    }
    return world
  })
}
