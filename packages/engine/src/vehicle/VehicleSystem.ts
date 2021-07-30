/**
 * @author HydraFire <github.com/HydraFire>
 */

import { Engine } from '../ecs/classes/Engine'
import { System } from '../ecs/classes/System'
import { PlayerInCar } from './components/PlayerInCar'
import { TransformComponent } from '../transform/components/TransformComponent'
import { VehicleComponent } from './components/VehicleComponent'

export class VehicleSystem extends System {
  diffSpeed: number = Engine.physicsFrameRate / Engine.networkFramerate

  freezeTimes = 0
  clientSnapshotFreezeTime = 0
  serverSnapshotFreezeTime = 0

  constructor() {
    super()
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
