import { AnimationGraph } from "./AnimationGraph";
import { EnteringVehicleState, ExitingVehicleState, IdleState, RunState, WalkState } from "./AnimationState";
import { CharacterStates } from "./Util";

/** Class to hold the animation graph for player entity. Every character entity will have their saperate graph. */
export class CharacterAnimationGraph extends AnimationGraph {
    static constructGraph = () => {
        return new CharacterAnimationGraph();
    }

    constructor() {
        super();

        // Initialize all the states
        const idleState = new IdleState();
        const walkState = new WalkState();
        const runState = new RunState();
        const enteringVehicleState = new EnteringVehicleState();
        const exitingVehicleState = new ExitingVehicleState();

        // Set the next states
        walkState.nextStates.push(IdleState, RunState, EnteringVehicleState);
        runState.nextStates.push(IdleState, WalkState, EnteringVehicleState);
        enteringVehicleState.nextStates.push(ExitingVehicleState);
        exitingVehicleState.nextStates.push(IdleState, EnteringVehicleState);
        exitingVehicleState.autoTransitionTo = CharacterStates.IDLE;

        // Add states to the graph
        this.states[CharacterStates.IDLE] = idleState;
        this.states[CharacterStates.WALK] = walkState;
        this.states[CharacterStates.RUN] = runState;
        this.states[CharacterStates.ENTERING_VEHICLE] = enteringVehicleState;
        this.states[CharacterStates.EXITING_VEHICLE] = exitingVehicleState;
        this.defaultState = this.states[CharacterStates.IDLE];
    }
}