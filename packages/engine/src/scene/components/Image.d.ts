import { Component } from "../../ecs/classes/Component";
export interface Props {
    src: string;
    projection: string;
    parent: any;
}
declare class ImageComponent extends Component<Props> {
    constructor(props: Props);
    src: string;
    projection: string;
    parent: any;
    static schema: {
        src: {
            type: import("../../ecs/types/Types").PropType<unknown, string>;
            default: string;
        };
        projection: {
            type: import("../../ecs/types/Types").PropType<unknown, string>;
            default: string;
        };
        parent: {
            default: any;
            type: import("../../ecs/types/Types").PropType<unknown, any>;
        };
    };
    copy(src: this): this;
    reset(): void;
}
export default ImageComponent;
