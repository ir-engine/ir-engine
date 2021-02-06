import { Component } from '../../ecs/classes/Component';
declare class ImageComponent extends Component<ImageComponent> {
    src: string;
    projection: string;
    parent: any;
    static _schema: {
        src: {
            type: import("@xr3ngine/engine/src/ecs/types/Types").PropType<unknown, string>;
            default: string;
        };
        projection: {
            type: import("@xr3ngine/engine/src/ecs/types/Types").PropType<unknown, string>;
            default: string;
        };
        parent: {
            default: any;
            type: import("@xr3ngine/engine/src/ecs/types/Types").PropType<unknown, any>;
        };
    };
}
export default ImageComponent;
