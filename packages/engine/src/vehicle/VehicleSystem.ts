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
import { PhysicsLifecycleState } from '../physics/enums/PhysicsStates'
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

  execute(delta: number): void {
    this.queryResults.VehicleComponent.added?.forEach((entity) => {
      VehicleBehavior(entity, { phase: PhysicsLifecycleState.onAdded })
    })

    this.queryResults.VehicleComponent.all?.forEach((entityCar) => {
      const networkCarId = getComponent(entityCar, NetworkObject).networkId
      VehicleBehavior(entityCar, { phase: PhysicsLifecycleState.onUpdate })

      this.queryResults.playerInCar.added?.forEach((entity) => {
        const component = getComponent(entity, PlayerInCar)
        if (component.networkCarId == networkCarId)
          onAddedInCar(entity, entityCar, component.currentFocusedPart, this.diffSpeed)
      })

      this.queryResults.playerInCar.all?.forEach((entity) => {
        const component = getComponent(entity, PlayerInCar)
        if (component.networkCarId == networkCarId) {
          switch (component.state) {
            case PhysicsLifecycleState.onAddEnding:
              onAddEndingInCar(entity, entityCar, component.currentFocusedPart, this.diffSpeed)
              break
            case PhysicsLifecycleState.onUpdate:
              onUpdatePlayerInCar(entity, entityCar, component.currentFocusedPart, this.diffSpeed)
              break
            case PhysicsLifecycleState.onStartRemove:
              onStartRemoveFromCar(entity, entityCar, component.currentFocusedPart, this.diffSpeed)
              break
          }
        }
      })

      this.queryResults.playerInCar.removed?.forEach((entity) => {
        let networkPlayerId
        const vehicle = getComponent(entityCar, VehicleComponent)
        if (!hasComponent(entity, NetworkObject)) {
          for (let i = 0; i < vehicle.seatPlane.length; i++) {
            if (
              vehicle[vehicle.seatPlane[i]] != null &&
              !Network.instance.networkObjects[vehicle[vehicle.seatPlane[i]]]
            ) {
              networkPlayerId = vehicle[vehicle.seatPlane[i]]
            }
          }
        } else {
          networkPlayerId = getComponent(entity, NetworkObject).networkId
        }
        for (let i = 0; i < vehicle.seatPlane.length; i++) {
          if (networkPlayerId == vehicle[vehicle.seatPlane[i]]) {
            onRemovedFromCar(entity, entityCar, i, this.diffSpeed)
          }
        }
      })
    })

    this.queryResults.VehicleComponent.removed?.forEach((entity) => {
      VehicleBehavior(entity, { phase: PhysicsLifecycleState.onRemoved })
    })
  }
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
