import { Engine } from '../../ecs/classes/Engine'
import { create } from '../../map'
import { MapProps } from '../../map/MapProps'

export async function createMap(entity, args: MapProps): void {
  Engine.scene.add(await create(Engine.renderer, args))
}
