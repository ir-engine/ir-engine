import { Behavior } from '@xr3ngine/engine/src/common/interfaces/Behavior';
import { updateVectorAnimation, clearAnimOnChange, changeAnimation } from "../behaviors/updateVectorAnimation";
import { getComponent, getMutableComponent } from '../../../ecs/functions/EntityFunctions';

import { CharacterStateTypes } from "../CharacterStateTypes";
import { CharacterComponent } from '../components/CharacterComponent';
import { StateSchemaValue } from '../../../state/interfaces/StateSchema';

const { DRIVING, ENTERING_VEHICLE, EXITING_VEHICLE } = CharacterStateTypes;

const animationsSchema = [
  {
    type: [DRIVING], name: 'driving', axis: 'xyz', speed: 1, customProperties: ['weight', 'dontHasHit'],
    value:      [ -0.5, 0, 0.5 ],
    weight:     [  0 ,  1,   0 ],
    dontHasHit: [  0 ,  0,   0 ]
  },{
    type: [ENTERING_VEHICLE], name: 'entering_car', axis:'xyz', speed: 0.5, customProperties: ['weight', 'dontHasHit'],
    value:      [ -1,   0,   1 ],
    weight:     [  0 ,  0,   0 ],
    dontHasHit: [  1 ,  1,   1 ]
  },
  {
    type: [EXITING_VEHICLE], name: 'exiting_car', axis:'y', speed: 0.5, customProperties: ['weight', 'dontHasHit'],
    value:      [  -1  ,   0  ],
    weight:     [   1 ,    0  ],
    dontHasHit: [   1  ,   0  ]
  }
];



const getDrivingValues: Behavior = (entity, args: {}, deltaTime: number): any => {
  const values = { test: 1 }
  //console.warn('onAddedInCar '+seat);
  /*
  const networkDriverId = getComponent<NetworkObject>(entity, NetworkObject).networkId;
  const vehicle = getMutableComponent<VehicleBody>(entityCar, VehicleBody);
  vehicle[vehicle.seatPlane[seat]] = networkDriverId;

  const actor = getMutableComponent<CharacterComponent>(entity, CharacterComponent as any);
  PhysicsSystem.physicsWorld.removeBody(actor.actorCapsule.body);

  const orientation = positionEnter(entity, entityCar, seat);
  getMutableComponent(entity, PlayerInCar).state = 'onAddEnding';

  if (isServer) return;
  // CLIENT
  addComponent(entity, EnteringVehicle);
  setState(entity, { state: CharacterStateTypes.ENTERING_VEHICLE });
  // LocalPlayerOnly
  if (Network.instance.userNetworkId != networkDriverId) return;
  addComponent(entityCar, LocalInputReceiver);
  addComponent(entityCar, FollowCameraComponent, {
    distance: 7,
    locked: false,
    mode: CameraModes.ThirdPerson,
    theta: Math.round( ( (270/Math.PI) * (orientation/3*2) ) + 180),
    phi: 20
   });
   */
   // going to animation clip behavior for set values to animations
   // any parameters
   return { values: values.test };
}

const initializeDriverState: Behavior = (entity, args: { x?: number, y?: number, z?: number }) => {
	const actor = getMutableComponent<CharacterComponent>(entity, CharacterComponent as any);
	if (!actor.initialized) return;

	actor.timer = 0;
	actor.velocityTarget.z = args?.z ?? 0;
	actor.velocityTarget.x = args?.x ?? 0;
	actor.velocityTarget.y = args?.y ?? 0;
};

// THIS STATE
export const DrivingState: StateSchemaValue = {
  componentProperties: [{
    component: CharacterComponent,
    properties: {}
  }],
  onEntry: [
    {
      behavior: initializeDriverState,
    },
    {
      behavior: clearAnimOnChange,
      args: {
        animationsSchema: animationsSchema
      }
    }
  ],
  onUpdate: [
    {
      behavior: updateVectorAnimation,
      args: {
        animationsSchema: animationsSchema, // animationsSchema
        updateAnimationsValues: getDrivingValues // function
      }
    }
  ]
};
