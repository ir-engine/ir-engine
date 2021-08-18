import { defineQuery, defineSystem, enterQuery, System } from '../ecs/bitecs'
import { Vector3 } from 'three'
import { getCoord, getTile, updateMap } from '.'
import { AvatarComponent } from '../avatar/components/AvatarComponent'
import { PI } from '../common/constants/MathConstants'
import { Engine } from '../ecs/classes/Engine'
import { ECSWorld } from '../ecs/classes/World'
import { getComponent } from '../ecs/functions/EntityFunctions'
import { Object3DComponent } from '../scene/components/Object3DComponent'
import { getCenterTile } from './MapBoxClient'

export const MapUpdateSystem = async (): Promise<System> => {
  const moveQuery = defineQuery([Object3DComponent, AvatarComponent])

  return defineSystem((world: ECSWorld) => {
    for (const entity of moveQuery(world)) {
      const position = getComponent(entity, Object3DComponent).value.position
      const centrCoord = getCoord()

      //Calculate new move coords
      const startLong = centrCoord[0]
      const startLat = centrCoord[1]
      const longtitude = -position.x / 111134.861111 + startLong
      const latitude = position.z / (Math.cos((startLat * PI) / 180) * 111134.861111) + startLat

      //get Current Tile
      const startTile = getTile()
      const moveTile = getCenterTile([longtitude, latitude])

      if (startTile[0] == moveTile[0] && startTile[1] == moveTile[1]) {
        console.log('in center')
      } else {
        // alert('Need to update')
        //UPdate Map
        updateMap(
          Engine.renderer,
          {
            isGlobal: true,
            scale: new Vector3(1, 1, 1)
          },
          longtitude,
          latitude,
          position
        )

        const remObj = Engine.scene.getObjectByName('MapObject')
        console.log(remObj)
        remObj.removeFromParent()
      }
    }
    return world
  })
}
