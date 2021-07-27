/**
 * @author HydraFire <github.com/HydraFire>
 */

import { Engine } from '../ecs/classes/Engine'
import { System, SystemAttributes } from '../ecs/classes/System'
import { getComponent, hasComponent } from '../ecs/functions/EntityFunctions'
import { Network } from '../networking/classes/Network'
import { NetworkObject } from '../networking/components/NetworkObject'
import { VehicleBehavior } from './behaviors/VehicleBehavior'
import { PlayerInCar } from './components/PlayerInCar'
import { TransformComponent } from '../transform/components/TransformComponent'
import { onAddedInCar } from './behaviors/onAddedInCar'
import { onAddEndingInCar } from './behaviors/onAddEndingInCar'
import { onRemovedFromCar } from './behaviors/onRemovedFromCar'
import { onStartRemoveFromCar } from './behaviors/onStartRemoveFromCar'
import { onUpdatePlayerInCar } from './behaviors/onUpdatePlayerInCar'
import { VehicleComponent } from './components/VehicleComponent'

export class VehicleSystem extends System {
  diffSpeed: number = Engine.physicsFrameRate / Engine.networkFramerate

  freezeTimes = 0
  clientSnapshotFreezeTime = 0
  serverSnapshotFreezeTime = 0

  constructor(attributes: SystemAttributes = {}) {
    super(attributes)
    VehicleSystem.instance = this
  }

  dispose(): void {
    super.dispose()
  }

  execute(delta: number): void {}
}

VehicleSystem.queries = {
  VehicleComponent: {
    components: [VehicleComponent, TransformComponent],
    listen: {
      added: true,
      removed: true
    }
  },
  playerInCar: {
    components: [PlayerInCar],
    listen: {
      added: true,
      removed: true
    }
  }
}
