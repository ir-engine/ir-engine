/**
 * A flag that indicates whether the override material workaround is enabled.
 *
 * @type {Boolean}
 * @private
 */
/**
 * An override material manager.
 *
 * Includes a workaround that fixes override materials for skinned meshes and
 * instancing. Doesn't fix uniforms such as normal maps and displacement maps.
 * Using the workaround may have a negative impact on performance if the scene
 * contains a lot of meshes.
 *
 * @implements {Disposable}
 */
export declare class OverrideMaterialManager {
    originalMaterials: Map<any, any>;
    material: any;
    materialInstanced: any;
    materialSkinning: any;
    /**
       * Constructs a new override material manager.
       *
       * @param {Material} [material=null] - An override material.
       */
    constructor(material?: any);
    /**
       * Sets the override material.
       *
       * @param {Material} material - The material.
       */
    setMaterial(material: any): void;
    /**
       * Renders the scene with the override material.
       *
       * @private
       * @param {WebGLRenderer} renderer - The renderer.
       * @param {Scene} scene - A scene.
       * @param {Camera} camera - A camera.
       */
    render(renderer: any, scene: any, camera: any): void;
    /**
       * Deletes cloned override materials.
       *
       * @private
       */
    disposeMaterials(): void;
    /**
       * Performs cleanup tasks.
       */
    dispose(): void;
    /**
       * Indicates whether the override material workaround is enabled.
       *
       * @type {Boolean}
       */
    static get workaroundEnabled(): boolean;
    /**
       * Enables or disables the override material workaround globally.
       *
       * This only affects post processing passes and effects.
       *
       * @type {Boolean}
       */
    static set workaroundEnabled(value: boolean);
}
