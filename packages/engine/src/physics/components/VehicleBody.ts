import { Vector3Type } from '../../common/types/NumericalTypes';
import { RaycastVehicle } from 'cannon-es';
import { Component } from '../../ecs/classes/Component';
import { Types } from '../../ecs/types/Types';

export class VehicleBody extends Component<VehicleBody> {
  //static instance: vehicleEntity = null
  arrayWheelsMesh: any
  vehicleMesh: any
  vehiclePhysics: any
  currentDriver: any

  maxSteerVal = 0.5
  maxForce = 500
  brakeForce = 1000000
  vehicle: RaycastVehicle
/*
  constructor () {
    super();
    vehicleEntity.instance = this;
  }

  dispose():void {
    super.dispose();
    vehicleEntity.instance = null;
  }
  */
}




VehicleBody.schema = {
  arrayWheelsMesh: { type: Types.Ref, default: [] },
  vehicleMesh: { type: Types.Ref, default: null },
  vehiclePhysics: { type: Types.Ref, default: null },
  currentDriver: { type: Types.Ref, default: null },

  maxSteerVal: { type: Types.Number, default: 0.5 },
  maxForce: { type: Types.Number, default: 500 },
  brakeForce: { type: Types.Number, default: 1000000 },
  vehicle: { type: Types.Ref, default: 0.5 }
};
