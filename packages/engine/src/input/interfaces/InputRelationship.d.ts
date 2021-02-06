import { InputAlias } from '../types/InputAlias';
export interface InputRelationship {
    opposes?: InputAlias[];
    overrides?: InputAlias[];
    blockedBy?: InputAlias[];
}
