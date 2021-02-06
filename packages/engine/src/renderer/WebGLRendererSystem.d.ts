import { System, SystemAttributes } from '../ecs/classes/System';
import { EffectComposer } from './postprocessing/core/EffectComposer';
import { PostProcessingSchema } from './postprocessing/PostProcessingSchema';
/** Handles rendering and post processing to WebGL canvas. */
export declare class WebGLRendererSystem extends System {
    /** Is system Initialized. */
    isInitialized: boolean;
    static composer: EffectComposer;
    /** Is resize needed? */
    static needsResize: boolean;
    /** Postprocessing schema. */
    postProcessingSchema: PostProcessingSchema;
    /** Resoulion scale. **Default** value is 1. */
    scaleFactor: number;
    downGradeTimer: number;
    upGradeTimer: number;
    /** Maximum Quality level of the rendered. **Default** value is 4. */
    maxQualityLevel: number;
    /** Current quality level. */
    qualityLevel: number;
    /** Previous Quality leve. */
    prevQualityLevel: number;
    /** Constructs WebGL Renderer System. */
    constructor(attributes?: SystemAttributes);
    /** Called on resize, sets resize flag. */
    onResize(): void;
    /** Removes resize listener. */
    dispose(): void;
    /**
      * Configure post processing.
      * Note: Post processing effects are set in the PostProcessingSchema provided to the system.
      * @param entity The Entity holding renderer component.
      */
    private configurePostProcessing;
    /**
     * Executes the system. Called each frame by default from the Engine.
     * @param delta Time since last frame.
     */
    execute(delta: number): void;
    /**
     * Change the quality of the renderer.
     * @param delta Time since last frame.
     */
    changeQualityLevel(delta: number): void;
}
