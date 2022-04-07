import { World } from '@xrengine/engine/src/ecs/classes/World'
import { defineQuery } from '@xrengine/engine/src/ecs/functions/ComponentFunctions'

import { AssetComponent } from '../components/AssetComponent'

export default async function AssetSystem(world: World) {
  const assetQuery = defineQuery([AssetComponent])

  return () => {
    for (const entity of assetQuery.enter()) {
    }

    for (const entity of assetQuery.exit()) {
    }
  }
}
