import { Engine } from '../../ecs/classes/Engine'
import { addMap } from '../../map'

export interface MapProps {
  isGlobal?: boolean
  name?: string
  style?: any
  useTimeOfDay?: boolean
  useDirectionalShadows?: boolean
  useStartCoordinates?: boolean
  startLatitude?: boolean
  startLongitude?: boolean
}

export function createMap(entity, args: MapProps): void {
  console.log('***MAP read, attempting to deserialize...')
  console.log('***MAP args are')
  console.log(args)
  addMap(Engine.scene, Engine.renderer)
}
