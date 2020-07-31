import InputAlias from "../types/InputAlias";
export default interface InputRelationship {
    opposes?: InputAlias[];
    overrides?: InputAlias[];
    blockedBy?: InputAlias[];
}
