import { Body } from "cannon-es";
import { RaycastResult } from "collision/RaycastResult";
import { AnimationAction, AnimationClip, AnimationMixer, Object3D, Scene } from "three";
import { BinaryValue } from "../../../src/common/enums/BinaryValue";
import { LifecycleValue } from "../../../src/common/enums/LifecycleValue";
import { now } from "../../../src/common/functions/now";
import { Engine } from "../../../src/ecs/classes/Engine";
import { Entity } from "../../../src/ecs/classes/Entity";
import { execute } from "../../../src/ecs/functions/EngineFunctions";
import { getComponent, getMutableComponent } from "../../../src/ecs/functions/ComponentFunctions";
import { registerSystem } from "../../../src/ecs/functions/SystemFunctions";
import { SystemUpdateType } from "../../../src/ecs/functions/SystemUpdateType";
import { Input } from "../../../src/input/components/Input";
import { BaseInput } from "../../../src/input/enums/BaseInput";
import { InputType } from "../../../src/input/enums/InputType";
import { Network } from "../../../src/networking//classes/Network";
import * as initializeNetworkObjectModule from "../../../src/networking/functions/initializeNetworkObject";
import { NetworkSchema } from "../../../src/networking/interfaces/NetworkSchema";
import { NetworkTransport } from "../../../src/networking/interfaces/NetworkTransport";
import { ClientNetworkStateSystem } from "../../../src/networking/systems/ClientNetworkStateSystem";
import { PhysicsSystem } from "../../../src/physics/systems/PhysicsSystem";
import { State } from "../../../src/state/components/State";
import { StateSystem } from "../../../src/state/systems/StateSystem";
import { CharacterAnimations } from "../../../src/character/CharacterAnimations";
import { CharacterComponent } from "../../../src/character/components/CharacterComponent";
import { DefaultNetworkSchema } from "../../../src/networking/templates/DefaultNetworkSchema";
import { createRemoteUserOnClient } from "../../_helpers/createRemoteUserOnClient";

const initializeNetworkObject = jest.spyOn(initializeNetworkObjectModule, 'initializeNetworkObject');
const dummyObject = new Object3D();
const dummyMixer = new AnimationMixer(dummyObject);
const mockedAnimActions = new Map<string, AnimationAction>();
jest.mock("../../../src/character/functions/setActorAnimation", () => {
  return {
    __esModule: true,
    // default: jest.fn(() => 42),
    setActorAnimation: jest.fn((entity, args: { name: string; transitionDuration: number }) => {
      const actor = getMutableComponent<CharacterComponent>(entity, CharacterComponent as any);
      let action:AnimationAction;
      if (mockedAnimActions.has(args.name)) {
        action = mockedAnimActions.get(args.name);
      } else {
        const dummyClip = new AnimationClip(args.name, oneFixedRunTimeSpan * 2, []);
        action = dummyMixer.clipAction(dummyClip);
        mockedAnimActions.set(args.name, action);
      }
      actor.currentAnimationAction = action;
      actor.currentAnimationLength = action.getClip().duration;
    }),
  };
});


class TestTransport implements NetworkTransport {
  isServer = false;

  handleKick(socket: any) {
  }

  initialize(address?: string, port?: number, opts?: {}): void | Promise<void> {
    return undefined;
  }

  sendData(data: any): void {
  }

  sendReliableData(data: any): void {
  }

}

const oneFixedRunTimeSpan = 1 / Engine.physicsFrameRate;
let localTime = now();
function executeFrame() {
  execute(oneFixedRunTimeSpan, localTime, SystemUpdateType.FIXED);
  execute(oneFixedRunTimeSpan, localTime, SystemUpdateType.Network);
  execute(oneFixedRunTimeSpan, localTime, SystemUpdateType.UPDATE);
  localTime += oneFixedRunTimeSpan;
}

let actorHasFloor = false;

beforeAll(() => {
  const networkSchema: NetworkSchema = {
    ...DefaultNetworkSchema,
    transport: TestTransport,
  };
  //
  // const InitializationOptions = {
  //   ...DefaultInitializationOptions,
  //   networking: {
  //     schema: networkSchema,
  //   }
  // };
  new Network();

  Engine.scene = new Scene();

  registerSystem(ClientNetworkStateSystem, { schema: networkSchema }); // 1
  registerSystem(PhysicsSystem); // 2 - handle hit
  registerSystem(StateSystem); // 3 - process floor hit

  PhysXInstance.instance.raycastClosest = jest.fn((start, end, rayCastOptions, rayResult:RaycastResult) => {
    if (!actorHasFloor) {
      return false;
    }
    // simulate floor and hit
    rayResult.body = new Body({mass:0});
    rayResult.hasHit = true;
    rayResult.hitPointWorld.set(0,0,0);
    rayResult.hitNormalWorld.set(0,1,0);
    return true;
  });

//PhysicsSystem.simulate = false;
//PhysXInstance.instance.gravity.set(0,0,0);
});

let player: Entity, actor:CharacterComponent, state:State;
beforeEach(() => {
  // by default actor should have floor
  actorHasFloor = true;
  const { createMessage, networkObject } = createRemoteUserOnClient({ initializeNetworkObjectMocked: initializeNetworkObject });
  player = networkObject.entity;
  actor = getComponent(player, CharacterComponent);
  state = getComponent(player, State);
});

describe("idle", () => {
  test("default idle", () => {
    execute(1, 1, SystemUpdateType.FIXED);
    const state = getComponent(player, State);
    expect(state.data.has(CharacterAnimations.DEFAULT)).toBe(true);
  });

  test("stays idle", () => {
    // if actor stays on ground it should keep idle state all the time
    const state = getComponent(player, State);
    expect(state.data.has(CharacterAnimations.DEFAULT)).toBe(true);

    for (let i=0;i<40;i++) {
      executeFrame();
      expect(state.data.has(CharacterAnimations.DEFAULT)).toBe(true);
    }
  });

  test("switch to fall", () => {
    // check switch from idle to fall if there is no ground
    const state = getComponent(player, State);
    expect(state.data.has(CharacterAnimations.DEFAULT)).toBe(true);

    actorHasFloor = false;
    executeFrame();
    expect(state.data.has(CharacterAnimations.FALLING)).toBe(true);
  });

  test("switch to jump", () => {
    const input = getComponent(player, Input);
    input.data.set(BaseInput.JUMP, {
      type: InputType.BUTTON,
      lifecycleState: LifecycleValue.Started,
      value: BinaryValue.ON
    });
    executeFrame();
    expect(state.data.has(CharacterAnimations.JUMP)).toBe(true);
  });

  test("switch to moving", () => {
    actor.localMovementDirection.set(1,0,1);
    executeFrame();
    expect(state.data.has(CharacterAnimations.DEFAULT)).toBe(true);
  });
});

describe("moving", () => {
  beforeEach(() => {
    actor.localMovementDirection.set(1,0,1);
    executeFrame();
  });

  test("stays moving", () => {
    // if actor stays on ground it should keep idle state all the time
    expect(state.data.has(CharacterAnimations.DEFAULT)).toBe(true);

    for (let i=0;i<40;i++) {
      actor.localMovementDirection.set(1,0,0); // to keep speed constant
      executeFrame();
      expect(state.data.has(CharacterAnimations.DEFAULT)).toBe(true);
    }
  });

  test("switch to idle", () => {
    expect(state.data.has(CharacterAnimations.DEFAULT)).toBe(true);

    actor.localMovementDirection.set(0,0,0);
    actor.actorCapsule.body.velocity.set(0,0,0);
    actor.velocityTarget.set(0,0,0);
    actor.velocity.set(0,0,0);
    for (let i=0;i<40;i++) {
      executeFrame();
    }
    expect(state.data.has(CharacterAnimations.DEFAULT)).toBe(true);
  });

  test("switch to fall", () => {
    // check switch from idle to fall if there is no ground
    expect(state.data.has(CharacterAnimations.DEFAULT)).toBe(true);

    actorHasFloor = false;
    executeFrame();
    expect(state.data.has(CharacterAnimations.FALLING)).toBe(true);
  });

  test("switch to jump", () => {
    const input = getComponent(player, Input);
    input.data.set(BaseInput.JUMP, {
      type: InputType.BUTTON,
      lifecycleState: LifecycleValue.Started,
      value: BinaryValue.ON
    });
    executeFrame();
    expect(state.data.has(CharacterAnimations.JUMP)).toBe(true);
  });
});

describe("fall", () => {
  beforeEach(() => {
    actorHasFloor = false;
    executeFrame();
  });

  test("stays falling", () => {
    // if actor stays on ground it should keep idle state all the time
    expect(state.data.has(CharacterAnimations.FALLING)).toBe(true);

    for (let i=0;i<10;i++) {
      executeFrame();
      expect(state.data.has(CharacterAnimations.FALLING)).toBe(true);
    }
  });

  test("hit the ground", () => {
    // check switch from idle to fall if there is no ground
    expect(state.data.has(CharacterAnimations.FALLING)).toBe(true);
    actorHasFloor = true;
    executeFrame();
    expect(state.data.has(CharacterAnimations.FALLING)).toBe(false);
  });

  test("no switch to jump", () => {
    const input = getComponent(player, Input);
    input.data.set(BaseInput.JUMP, {
      type: InputType.BUTTON,
      lifecycleState: LifecycleValue.Started,
      value: BinaryValue.ON
    });
    executeFrame();
    expect(state.data.has(CharacterAnimations.FALLING)).toBe(true);
  });

  test("no switch to moving", () => {
    expect(state.data.has(CharacterAnimations.FALLING)).toBe(true);

    actor.localMovementDirection.set(1,0,1);
    executeFrame();
    expect(state.data.has(CharacterAnimations.FALLING)).toBe(true);
  });
});

describe('fall hit the ground', () => {
  let body:Body;
  beforeEach(() => {
    actorHasFloor = false;
    body = actor.actorCapsule.body;
    executeFrame();
  });

  test("landing: low velocity - moving = drop idle", () => {
    // check switch from idle to fall if there is no ground
    expect(state.data.has(CharacterAnimations.FALLING)).toBe(true);
    body.velocity.set(0,-3,0);
    actorHasFloor = true;
    executeFrame();
    expect(state.data.has(CharacterAnimations.DROP)).toBe(true);
  });
  test("landing: low velocity + moving = moving", () => {
    // check switch from idle to fall if there is no ground
    expect(state.data.has(CharacterAnimations.FALLING)).toBe(true);
    actor.localMovementDirection.set(1,0,1);
    body.velocity.set(0,-3,0);
    actorHasFloor = true;
    executeFrame();
    // TODO: add check of MOVING state, for now just absence of drop or idle
    expect(state.data.has(CharacterAnimations.DEFAULT)).toBe(false);
    expect(state.data.has(CharacterAnimations.DROP)).toBe(false);
  });
  test("landing: high velocity - moving = drop rolling", () => {
    // check switch from idle to fall if there is no ground
    expect(state.data.has(CharacterAnimations.FALLING)).toBe(true);
    body.velocity.set(0,-10,0);
    executeFrame(); // apply velocity
    actorHasFloor = true;
    executeFrame(); // hit
    expect(state.data.has(CharacterAnimations.DROP)).toBe(true);
  });

  test("landing: high velocity + moving = drop rolling", () => {
    // check switch from idle to fall if there is no ground
    expect(state.data.has(CharacterAnimations.FALLING)).toBe(true);
    body.velocity.set(0,-10,0);
    executeFrame(); // apply velocity
    actor.localMovementDirection.set(1,0,1);
    actorHasFloor = true;
    executeFrame(); // hit
    // TODO: add check of MOVING state, for now just absence of drop or idle
    expect(state.data.has(CharacterAnimations.DROP)).toBe(true);
  });
});