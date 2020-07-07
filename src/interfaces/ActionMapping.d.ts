import ActionType from "../types/ActionType";
export default interface ActionRules {
    opposes?: ActionType[];
    overrides?: ActionType[];
    blockedBy?: ActionType[];
}
