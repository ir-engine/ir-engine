import { Vector3 } from 'three'
import { getCoord, getScaleArg, getTile } from '.'
import { PI } from '../common/constants/MathConstants'
import { Engine } from '../ecs/classes/Engine'
import { defineQuery, getComponent } from '../ecs/functions/ComponentFunctions'
import { Object3DComponent } from '../scene/components/Object3DComponent'
import { getCenterTile } from './MapBoxClient'
import { LocalInputTagComponent } from '../input/components/LocalInputTagComponent'
import { updateMap } from '../scene/functions/createMap'
import { GeoLabelSetComponent } from './GeoLabelSetComponent'
import { System } from '../ecs/classes/System'
import { World } from '../ecs/classes/World'

export default async function MapUpdateSystem(world: World): Promise<System> {
  const moveQuery = defineQuery([Object3DComponent, LocalInputTagComponent])
  const labelsQuery = defineQuery([GeoLabelSetComponent])
  let updateStatus = false

  return () => {
    for (const entity of moveQuery.enter(world)) {
      const position = getComponent(entity, Object3DComponent).value.position
    }

    for (const entity of moveQuery(world)) {
      const position = getComponent(entity, Object3DComponent).value.position
      const centrCoord = getCoord()
      //Calculate new move coords
      const startLong = centrCoord[0]
      const startLat = centrCoord[1]
      const scaleArg = getScaleArg()

      const longtitude = position.x / (111134.861111 * scaleArg) + startLong
      const latitude = -position.z / (Math.cos((startLat * PI) / 180) * 111321.377778 * scaleArg) + startLat

      //get Current Tile
      const startTile = getTile()
      const moveTile = getCenterTile([longtitude, latitude])

      if (updateStatus == false && moveTile[0] && startTile[0]) {
        if (startTile[0] == moveTile[0] && startTile[1] == moveTile[1]) {
          console.log('in center')
        } else {
          // NOTE: commenting this out for now since this was detrimenting player experience
          // updateMap(
          //   {
          //     scale: new Vector3(scaleArg, scaleArg, scaleArg)
          //   },
          //   longtitude,
          //   latitude,
          //   position
          // )
          updateStatus = true
        }
      } else {
        if (startTile[0] == moveTile[0] && startTile[1] == moveTile[1]) {
          updateStatus = false
        }
      }
    }

    for (const entity of labelsQuery(world)) {
      const labels = getComponent(entity, GeoLabelSetComponent).value
      for (const label of labels) {
        label.onUpdate(Engine.camera)
      }
    }
  }
}
