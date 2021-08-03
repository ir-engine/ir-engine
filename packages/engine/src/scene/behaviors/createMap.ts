import { Engine } from '../../ecs/classes/Engine'
import { addMap } from '../../map'
import { MapProps } from '../../map/MapProps'

export function createMap(entity, args: MapProps): void {
  addMap(Engine.scene, Engine.renderer, args)
}
