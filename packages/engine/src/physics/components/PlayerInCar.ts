import { RaycastVehicle } from 'cannon-es';
import { Component } from '../../ecs/classes/Component';
import { Types } from '../../ecs/types/Types';

export class PlayerInCar extends Component<any> {
  // Move to Vehicle component
  entityCar: any

}
PlayerInCar.schema = {
  entityCar: { type: Types.Ref, default: null }
};
