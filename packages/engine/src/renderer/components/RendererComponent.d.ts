import { PostProcessingSchema } from '../../postprocessing/interfaces/PostProcessingSchema';
import { Component } from '../../ecs/classes/Component';
import { EffectComposer } from '../../postprocessing/core/EffectComposer';
/** Component class for renderer. */
export declare class RendererComponent extends Component<any> {
    /** Instance of the renderer. */
    static instance: RendererComponent;
    composer: EffectComposer;
    /** Is resize needed? */
    needsResize: boolean;
    /** Postprocessing schema. */
    postProcessingSchema: PostProcessingSchema;
    /** Constructs a new renderer */
    constructor(postProcessingSchema?: PostProcessingSchema);
    /** Dispose the component. */
    dispose(): void;
}
