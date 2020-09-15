import { Vector3Type } from '../../common/types/NumericalTypes';
import { RaycastVehicle } from 'cannon-es';
import { Component } from '../../ecs/classes/Component';
import { Types } from '../../ecs/types/Types';

export class VehicleBody extends Component<VehicleBody> {
  //static instance: vehicleEntity = null
  currentDriver: any

  vehicleMesh: any
  vehiclePhysics: any

  arrayWheelsMesh: any
  arrayWheelsPosition: any
  wheelRadius: number


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
  currentDriver: { type: Types.Ref, default: null },

  vehicleMesh: { type: Types.Ref, default: null },
  vehiclePhysics: { type: Types.Ref, default: null },

  arrayWheelsMesh: { type: Types.Ref, default: [] },
  arrayWheelsPosition: { type: Types.Ref, default: [] },
  wheelRadius: { type: Types.Number, default: 0.35 },

  maxSteerVal: { type: Types.Number, default: 0.5 },
  maxForce: { type: Types.Number, default: 500 },
  brakeForce: { type: Types.Number, default: 1000000 },
  vehicle: { type: Types.Ref, default: 0.5 }
};
