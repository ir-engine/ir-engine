import { System } from "ecsy";
export default class InputActionSystem extends System {
    private _userInputActionQueue;
    private _skip;
    private _userInput;
    execute(): void;
    private validateActions;
    private actionsOpposeEachOther;
    private actionIsBlockedByAnother;
    private actionOverridesAnother;
    private applyInputToListener;
}
