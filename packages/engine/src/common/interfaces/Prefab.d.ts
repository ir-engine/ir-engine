import { BehaviorValue } from "./BehaviorValue";
export interface Prefab {
    components?: {
        type: any;
        data?: any;
    }[];
    onCreate?: BehaviorValue[];
    onDestroy?: BehaviorValue[];
}
