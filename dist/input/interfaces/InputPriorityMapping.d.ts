import InputAlias from "../types/InputAlias";
export default interface ButtonPriorityMap {
    opposes?: InputAlias[];
    overrides?: InputAlias[];
    blockedBy?: InputAlias[];
}
