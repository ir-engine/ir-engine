import { Vector3Type } from '../../common/types/NumericalTypes';
import { Component } from '../../ecs/classes/Component';
import { Types } from '../../ecs/types/Types';

interface PropTypes {
  wheelMesh: any
  vehicleMesh: any
  vehiclePhysics: any
  currentDriver: any
}

export class VehicleBody extends Component<VehicleBody> {
  wheelMesh: any
  vehicleMesh: any
  vehiclePhysics: any
  currentDriver: any
}

VehicleBody.schema = {
  wheelMesh: { type: Types.Ref, default: null },
  vehicleMesh: { type: Types.Ref, default: null },
  vehiclePhysics: { type: Types.Ref, default: null },
  currentDriver: { type: Types.Ref, default: null }
};
