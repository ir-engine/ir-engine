import { Component, Types } from "ecsy"
import { RaycastVehicle } from "cannon-es/src/objects/RaycastVehicle"

export class VehicleComponent extends Component<any> {
  // Move to Vehicle component
  maxSteerVal = 0.5
  maxForce = 1000
  brakeForce = 1000000
  vehicle: RaycastVehicle
}
VehicleComponent.schema = {
  maxSteerVal: { type: Types.Number, default: 0.5 },
  maxForce: { type: Types.Number, default: 1000 },
  brakeForce: { type: Types.Number, default: 1000000 },
  vehicle: { type: Types.Ref, default: 0.5 }
}
