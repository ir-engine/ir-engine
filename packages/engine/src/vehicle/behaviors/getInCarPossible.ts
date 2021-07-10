import { getComponent } from '../../ecs/functions/EntityFunctions'
import { InteractionCheckHandler } from '../../interaction/types/InteractionTypes'
import { VehicleComponent } from '../components/VehicleComponent'

/**
 * @author HydraFire <github.com/HydraFire>
 */

export const getInCarPossible: InteractionCheckHandler = (possibleDriverEntity, carEntity, focusedPart = 0) => {
  const vehicle = getComponent(carEntity, VehicleComponent)
  //console.warn('vehicle.driver '+vehicle.driver);
  //console.warn('vehicle.passenger '+vehicle.passenger);
  return vehicle && !vehicle[vehicle.seatPlane[focusedPart]]
}
