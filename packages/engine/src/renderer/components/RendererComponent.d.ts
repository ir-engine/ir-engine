import { EffectComposer } from "postprocessing";
import { PostProcessingSchema } from "../interfaces/PostProcessingSchema";
import { Component } from "../../ecs/classes/Component";
export declare class RendererComponent extends Component<any> {
    static instance: RendererComponent;
    renderer: any;
    composer: EffectComposer;
    needsResize: boolean;
    postProcessingSchema: PostProcessingSchema;
    constructor();
}
