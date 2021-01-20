import * as initializeNetworkObjectModule from "../../../src/networking/functions/initializeNetworkObject";
import { AnimationAction, AnimationClip, AnimationMixer, Object3D, Scene } from "three";
import { getComponent, getMutableComponent } from "../../../src/ecs/functions/EntityFunctions";
import { CharacterComponent } from "../../../src/templates/character/components/CharacterComponent";
import { NetworkTransport } from "../../../src/networking/interfaces/NetworkTransport";
import { Engine } from "../../../src/ecs/classes/Engine";
import { now } from "../../../src/common/functions/now";
import { execute } from "../../../src/ecs/functions/EngineFunctions";
import { SystemUpdateType } from "../../../src/ecs/functions/SystemUpdateType";
import { NetworkSchema } from "../../../src/networking/interfaces/NetworkSchema";
import { DefaultNetworkSchema } from "../../../src/templates/networking/DefaultNetworkSchema";
import { Network } from "../../../src/networking/components/Network";
import { registerSystem } from "../../../src/ecs/functions/SystemFunctions";
import { ClientNetworkSystem } from "../../../src/networking/systems/ClientNetworkSystem";
import { PhysicsSystem } from "../../../src/physics/systems/PhysicsSystem";
import { StateSystem } from "../../../src/state/systems/StateSystem";
import { PhysicsManager } from "../../../src/physics/components/PhysicsManager";
import { RaycastResult } from "collision/RaycastResult";
import { Entity } from "../../../src/ecs/classes/Entity";
import { State } from "../../../src/state/components/State";
import { createRemoteUserOnClient } from "../../_helpers/createRemoteUserOnClient";
import { Body } from "cannon-es";
import { CharacterStateTypes } from "../../../src/templates/character/CharacterStateTypes";
import { Input } from "../../../src/input/components/Input";
import { DefaultInput } from "../../../src/templates/shared/DefaultInput";
import { InputType } from "../../../src/input/enums/InputType";
import { LifecycleValue } from "../../../src/common/enums/LifecycleValue";
import { BinaryValue } from "../../../src/common/enums/BinaryValue";

const initializeNetworkObject = jest.spyOn(initializeNetworkObjectModule, 'initializeNetworkObject');
// setActorAnimationModule.setActorAnimation = jest.fn((entity, args: { name: string; transitionDuration: number }) => {
//
// });
const dummyObject = new Object3D();
const dummyMixer = new AnimationMixer(dummyObject);
const mockedAnimActions = new Map<string, AnimationAction>();
jest.mock("../../../src/templates/character/behaviors/setActorAnimation", () => {
    return {
        __esModule: true,
        // default: jest.fn(() => 42),
        setActorAnimation: jest.fn((entity, args: { name: string; transitionDuration: number }) => {
            const actor = getMutableComponent<CharacterComponent>(entity, CharacterComponent as any);
            let action: AnimationAction;
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
    execute(oneFixedRunTimeSpan, localTime, SystemUpdateType.Fixed);
    execute(oneFixedRunTimeSpan, localTime, SystemUpdateType.Network);
    execute(oneFixedRunTimeSpan, localTime, SystemUpdateType.Free);
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

    registerSystem(ClientNetworkSystem, { schema: networkSchema }); // 1
    registerSystem(PhysicsSystem); // 2 - handle hit
    registerSystem(StateSystem); // 3 - process floor hit

    PhysicsManager.instance.physicsWorld.raycastClosest = jest.fn((start, end, rayCastOptions, rayResult: RaycastResult) => {
        if (!actorHasFloor) {
            return false;
        }
        // simulate floor and hit
        rayResult.body = new Body({ mass: 0 });
        rayResult.hasHit = true;
        rayResult.hitPointWorld.set(0, 0, 0);
        rayResult.hitNormalWorld.set(0, 1, 0);
        return true;
    });

//PhysicsManager.instance.simulate = false;
//PhysicsManager.instance.physicsWorld.gravity.set(0,0,0);
});

let player: Entity, actor: CharacterComponent, state: State;
beforeEach(() => {
    // by default actor should have floor
    actorHasFloor = true;
    const {
        createMessage,
        networkObject
    } = createRemoteUserOnClient({ initializeNetworkObjectMocked: initializeNetworkObject });
    player = networkObject.entity;
    actor = getComponent(player, CharacterComponent);
    state = getComponent(player, State);
});

describe("moving animations", () => {
    beforeEach(() => {
        actor.localMovementDirection.set(1,0,1);
        executeFrame();
    });

    test("stays moving", () => {
        // if actor stays on ground it should keep idle state all the time
        expect(state.data.has(CharacterStateTypes.MOVING)).toBe(true);

        for (let i=0;i<40;i++) {
            actor.localMovementDirection.set(1,0,0); // to keep speed constant
            executeFrame();
            expect(state.data.has(CharacterStateTypes.MOVING)).toBe(true);
        }
    });

    test("switch to idle", () => {
        expect(state.data.has(CharacterStateTypes.MOVING)).toBe(true);

        actor.localMovementDirection.set(0,0,0);
        executeFrame();
        expect(state.data.has(CharacterStateTypes.IDLE)).toBe(true);
    });

    test("switch to fall", () => {
        // check switch from idle to fall if there is no ground
        expect(state.data.has(CharacterStateTypes.MOVING)).toBe(true);

        actorHasFloor = false;
        executeFrame();
        expect(state.data.has(CharacterStateTypes.FALLING)).toBe(true);
    });

    test("switch to jump", () => {
        const input = getComponent(player, Input);
        input.data.set(DefaultInput.JUMP, {
            type: InputType.BUTTON,
            lifecycleState: LifecycleValue.STARTED,
            value: BinaryValue.ON
        });
        executeFrame();
        expect(state.data.has(CharacterStateTypes.JUMP_RUNNING)).toBe(true);
    });
});