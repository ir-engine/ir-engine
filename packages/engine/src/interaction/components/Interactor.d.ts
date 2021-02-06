import { Component } from "../../ecs/classes/Component";
import { Intersection } from "three";
export declare class Interactor extends Component<Interactor> {
    focusedInteractive: any;
    focusedRayHit: Intersection | null;
    BoxHitResult: any;
    subFocusedArray: any[] | null;
    static _schema: {
        subFocusedArray: {
            type: import("@xr3ngine/engine/src/ecs/types/Types").PropType<unknown, any[]>;
            default: any[];
        };
    };
}
