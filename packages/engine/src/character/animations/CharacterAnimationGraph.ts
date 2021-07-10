import { AnimationGraph } from "./AnimationGraph";
import { EnteringVehicleState, ExitingVehicleState, IdleState, LoopableEmoteState, RunState, WalkState } from "./AnimationState";
import { CharacterStates } from "./Util";

/** Class to hold the animation graph for player entity. Every character entity will have their saperate graph. */
export class CharacterAnimationGraph extends AnimationGraph {

    constructor() {
        super();

        // Initialize all the states
        const idleState = new IdleState();
        const walkState = new WalkState();
        const runState = new RunState();
        const enteringVehicleState = new EnteringVehicleState();
        const exitingVehicleState = new ExitingVehicleState();
        // const emoteState = new EmoteState();
        const loopableEmoteState = new LoopableEmoteState();

        // Set the next states
        walkState.nextStates.push(IdleState, RunState, EnteringVehicleState);
        runState.nextStates.push(IdleState, WalkState, EnteringVehicleState);
        enteringVehicleState.nextStates.push(ExitingVehicleState);
        exitingVehicleState.nextStates.push(IdleState, EnteringVehicleState);
        exitingVehicleState.autoTransitionTo = CharacterStates.IDLE;
        // emoteState.nextStates.push(IdleState, WalkState, RunState, EnteringVehicleState, LoopableEmoteState);
        // emoteState.autoTransitionTo = CharacterStates.IDLE;
        loopableEmoteState.nextStates.push(WalkState, RunState, EnteringVehicleState);

        // Add states to the graph
        this.states[CharacterStates.IDLE] = idleState;
        this.states[CharacterStates.WALK] = walkState;
        this.states[CharacterStates.RUN] = runState;
        this.states[CharacterStates.ENTERING_VEHICLE] = enteringVehicleState;
        this.states[CharacterStates.EXITING_VEHICLE] = exitingVehicleState;
        // this.states[CharacterStates.EMOTE] = emoteState;
        this.states[CharacterStates.LOOPABLE_EMOTE] = loopableEmoteState;
        this.defaultState = this.states[CharacterStates.IDLE];
    }
}
