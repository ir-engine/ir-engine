import { getCoord, getTile } from '.'
import { AvatarComponent } from '../avatar/components/AvatarComponent'
import { PI } from '../common/constants/MathConstants'
import { System } from '../ecs/classes/System'
import { getComponent } from '../ecs/functions/EntityFunctions'
import { Object3DComponent } from '../scene/components/Object3DComponent'
import { getCenterTile } from './MapBoxClient'

export class MapUpdateSystem extends System {
  execute(delta: number, time: number): void {
    for (const entity of this.queryResults.move.changed) {
      const position = getComponent(entity, Object3DComponent).value.position
      const centrCoord = getCoord()

      //Calculate new move coords
      const startLong = centrCoord[0]
      const startLat = centrCoord[1]
      const latitude = position.z / (Math.cos((startLat * PI) / 180) * 111134.861111) + startLat
      const longtitude = -position.x / 111134.861111 + startLong

      //get Current Tile
      const startTile = getTile()
      const moveTile = getCenterTile([longtitude, latitude])

      // console.log(startTile)
      // console.log(moveTile)

      if (startTile[0] == moveTile[0] && startTile[1] == moveTile[1]) {
        console.log('in center')
      } else {
        alert('Need to update')
        //UPdate Map
        // updateMap(Engine.renderer, {
        //   isGlobal:true,
        //   scale: new Vector3(1,1,1)
        // }, newCoord, position)

        // const remObj = Engine.scene.getObjectByName("Mappa")
        // console.log(remObj)
        // remObj.removeFromParent()
      }
    }
  }

  static queries: any = {
    move: {
      components: [Object3DComponent, AvatarComponent],
      listen: {
        added: true,
        changed: true
      }
    }
  }
}
