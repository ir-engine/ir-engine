import InputAlias from "../types/InputAlias";
export default interface InputRelationshipMapping {
    opposes?: InputAlias[];
    overrides?: InputAlias[];
    blockedBy?: InputAlias[];
}
