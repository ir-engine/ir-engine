import { BaseInput } from '@xr3ngine/engine/src/input/enums/BaseInput';
import { Thumbsticks } from '../../common/enums/Thumbsticks';
import { Behavior } from '../../common/interfaces/Behavior';
import { Entity } from '../../ecs/classes/Entity';
import { getComponent, getMutableComponent } from '../../ecs/functions/EntityFunctions';
import { Input } from "../../input/components/Input";
import { GamepadButtons } from '../../input/enums/GamepadButtons';
import { InputType } from '../../input/enums/InputType';
import { MouseInput } from '../../input/enums/MouseInput';
import { InputRelationship } from '../../input/interfaces/InputRelationship';
import { InputSchema } from '../../input/interfaces/InputSchema';
import { BaseInputSchema } from "../../input/schema/BaseInputSchema";
import { InputAlias } from "../../input/types/InputAlias";
import { VehicleBody } from '../../physics/components/VehicleBody';
import { Object3DComponent } from '../../scene/components/Object3DComponent';
import { setState } from '../../state/behaviors/setState';
import { CharacterStateTypes } from '../character/CharacterStateTypes';

const getOutCar: Behavior = (entity: Entity): void => {
  console.warn("Getting out of car");
  const vehicleComponent = getMutableComponent(entity, VehicleBody);
  const entityDriver = vehicleComponent.currentDriver;

  setState(entityDriver, {state: CharacterStateTypes.EXITING_CAR});

  const event = new CustomEvent('player-in-car', { detail:{inCar:false} });
  document.dispatchEvent(event);

};

const drive: Behavior = (entity: Entity, args: { direction: number }): void => {
  const vehicleComponent = getMutableComponent<VehicleBody>(entity, VehicleBody);
  const object = getComponent<Object3DComponent>(entity, Object3DComponent).value;
  const vehicle = vehicleComponent.vehiclePhysics;

  vehicle.setBrake(0, 0);
  vehicle.setBrake(0, 1);
  vehicle.setBrake(0, 2);
  vehicle.setBrake(0, 3);

  // direction is reversed to match 1 to be forward
  vehicle.applyEngineForce(vehicleComponent.maxForce * args.direction * -1, 2);
  vehicle.applyEngineForce(vehicleComponent.maxForce * args.direction * -1, 3);
};

const driveByInputAxis: Behavior = (entity: Entity, args: { input: InputAlias; inputType: InputType }): void => {
  const input =  getComponent<Input>(entity, Input as any);
  const data = input.data.get(args.input);

  const vehicleComponent = getMutableComponent<VehicleBody>(entity, VehicleBody);
  const vehicle = vehicleComponent.vehiclePhysics;

  vehicle.setBrake(0, 0);
  vehicle.setBrake(0, 1);
  vehicle.setBrake(0, 2);
  vehicle.setBrake(0, 3);

  if (data.type === InputType.TWODIM) {
    // direction is reversed to match 1 to be forward
    vehicle.applyEngineForce(vehicleComponent.maxForce * data.value[0] * -1, 2);
    vehicle.applyEngineForce(vehicleComponent.maxForce * data.value[0] * -1, 3);

    vehicle.setSteeringValue( vehicleComponent.maxSteerVal * data.value[1], 0);
    vehicle.setSteeringValue( vehicleComponent.maxSteerVal * data.value[1], 1);
  }
};


export const driveHandBrake: Behavior = (entity: Entity, args: { on: boolean }): void => {
  const vehicleComponent = getMutableComponent<VehicleBody>(entity, VehicleBody);
  const vehicle = vehicleComponent.vehiclePhysics;

  vehicle.setBrake(args.on? 10 : 0, 0);
  vehicle.setBrake(args.on? 10 : 0, 1);
  vehicle.setBrake(args.on? 10 : 0, 2);
  vehicle.setBrake(args.on? 10 : 0, 3);
};

export const driveSteering: Behavior = (entity: Entity, args: { direction: number }): void => {
  const vehicleComponent = getMutableComponent(entity, VehicleBody);
  const vehicle = vehicleComponent.vehiclePhysics;

  vehicle.setSteeringValue( vehicleComponent.maxSteerVal * args.direction, 0);
  vehicle.setSteeringValue( vehicleComponent.maxSteerVal * args.direction, 1);
};


export const VehicleInputSchema: InputSchema = {
  ...BaseInputSchema,
  // Map mouse buttons to abstract input
  mouseInputMap: {
    buttons: {
      [MouseInput.LeftButton]: BaseInput.PRIMARY,
    //  [MouseInput.LeftButton]: BaseInput.INTERACT,
      [MouseInput.RightButton]: BaseInput.SECONDARY,
      [MouseInput.MiddleButton]: BaseInput.INTERACT
    },
    axes: {
      [MouseInput.MouseMovement]: BaseInput.MOUSE_MOVEMENT,
      [MouseInput.MousePosition]: BaseInput.SCREENXY,
      [MouseInput.MouseClickDownPosition]: BaseInput.SCREENXY_START,
      [MouseInput.MouseClickDownTransformRotation]: BaseInput.ROTATION_START,
      [MouseInput.MouseClickDownMovement]: BaseInput.LOOKTURN_PLAYERONE,
      [MouseInput.MouseScroll]: BaseInput.CAMERA_SCROLL
    }
  },
  // Map gamepad buttons to abstract input
  gamepadInputMap: {
    buttons: {
      [GamepadButtons.A]: BaseInput.JUMP,
      [GamepadButtons.B]: BaseInput.CROUCH, // B - back
      [GamepadButtons.X]: BaseInput.SPRINT, // X - secondary input
      [GamepadButtons.Y]: BaseInput.INTERACT, // Y - tertiary input
      // 4: BaseInput.DEFAULT, // LB
      // 5: BaseInput.DEFAULT, // RB
      // 6: BaseInput.DEFAULT, // LT
      // 7: BaseInput.DEFAULT, // RT
      // 8: BaseInput.DEFAULT, // Back
      // 9: BaseInput.DEFAULT, // Start
      // 10: BaseInput.DEFAULT, // LStick
      // 11: BaseInput.DEFAULT, // RStick
      [GamepadButtons.DPad1]: BaseInput.FORWARD, // DPAD 1
      [GamepadButtons.DPad2]: BaseInput.BACKWARD, // DPAD 2
      [GamepadButtons.DPad3]: BaseInput.LEFT, // DPAD 3
      [GamepadButtons.DPad4]: BaseInput.RIGHT // DPAD 4
    },
    axes: {
      [Thumbsticks.Left]: BaseInput.MOVEMENT_PLAYERONE,
      [Thumbsticks.Right]: BaseInput.LOOKTURN_PLAYERONE
    }
  },
  // Map keyboard buttons to abstract input
  keyboardInputMap: {
    w: BaseInput.FORWARD,
    a: BaseInput.LEFT,
    s: BaseInput.BACKWARD,
    d: BaseInput.RIGHT,
    ' ': BaseInput.JUMP,
    shift: BaseInput.CROUCH,
    p: BaseInput.POINTER_LOCK,
    e: BaseInput.INTERACT,
    c: BaseInput.SECONDARY
  },
  // Map how inputs relate to each other
  inputRelationships: {
    [BaseInput.FORWARD]: {opposes: [BaseInput.BACKWARD]} as InputRelationship,
    [BaseInput.BACKWARD]: {opposes: [BaseInput.FORWARD]} as InputRelationship,
    [BaseInput.LEFT]: {opposes: [BaseInput.RIGHT]} as InputRelationship,
    [BaseInput.RIGHT]: {opposes: [BaseInput.LEFT]} as InputRelationship,
    [BaseInput.CROUCH]: {blockedBy: [BaseInput.JUMP, BaseInput.SPRINT]} as InputRelationship,
    [BaseInput.JUMP]: {overrides: [BaseInput.CROUCH]} as InputRelationship
  },
  // "Button behaviors" are called when button input is called (i.e. not axis input)
  inputButtonBehaviors: {
    [BaseInput.SECONDARY]: {
      ended: [
      ]
    },
    [BaseInput.INTERACT]: {
      started: [
        {
          behavior: getOutCar,
          args: {}
        }
      ]
    },
    [BaseInput.FORWARD]: {
      started: [
        {
          behavior: drive,
          args: {
            direction: 1
          }
        }
      ],
      continued: [
        {
          behavior: drive,
          args: {
            direction: 1
          }
        }
      ],
      ended: [
        {
          behavior: drive,
          args: {
            direction: 0
          }
        }
      ]
    },
    [BaseInput.BACKWARD]: {
      started: [
        {
          behavior: drive,
          args: {
            direction: -1
          }
        }
      ],
      continued: [
        {
          behavior: drive,
          args: {
            direction: -1
          }
        }
      ],
      ended: [
        {
          behavior: drive,
          args: {
            direction: 0
          }
        }
      ]
    },
    [BaseInput.LEFT]: {
      started: [
        {
          behavior: driveSteering,
          args: {
            direction: 1
          }
        }
      ],
      continued: [
        {
          behavior: driveSteering,
          args: {
            direction: 1
          }
        }
      ],
      ended: [
        {
          behavior: driveSteering,
          args: {
            direction: 0
          }
        }
      ]
    },
    [BaseInput.RIGHT]: {
      started: [
        {
          behavior: driveSteering,
          args: {
            direction: -1
          }
        }
      ],
      continued: [
        {
          behavior: driveSteering,
          args: {
            direction: -1
          }
        }
      ],
      ended: [
        {
          behavior: driveSteering,
          args: {
            direction: 0
          }
        }
      ]
    },
    [BaseInput.JUMP]: {
      started: [
        {
          behavior: driveHandBrake,
          args: {
            on: true
          }
        }
      ],
      continued: [
        {
          behavior: driveHandBrake,
          args: {
            on: true
          }
        }
      ],
      ended: [
        {
          behavior: driveHandBrake,
          args: {
            on: false
          }
        }
      ],
    },
  },
  // Axis behaviors are called by continuous input and map to a scalar, vec2 or vec3
  inputAxisBehaviors: {
    [BaseInput.MOVEMENT_PLAYERONE]: {
      started: [
        {
          behavior: driveByInputAxis,
          args: {
            input: BaseInput.MOVEMENT_PLAYERONE,
            inputType: InputType.TWODIM
          }
        }
      ],
      changed: [
        {
          behavior: driveByInputAxis,
          args: {
            input: BaseInput.MOVEMENT_PLAYERONE,
            inputType: InputType.TWODIM
          }
        }
      ]
    }
  }
};
