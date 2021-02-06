import { ParticleMesh, ParticleMeshMaterial, particleMeshOptions, ParticleGeometry } from "../interfaces";
/**
 * Create particle mesh from options.
 * @param options Options to be applied on particle mesh.
 *
 * @returns Newly created particle mesh.
 */
export declare function createParticleMesh(options: particleMeshOptions): ParticleMesh;
/**
 * Update geometry with provided configs.
 * @param geometry Geometry to be updated.
 * @param config Config which will be applied on geometry.
 */
export declare function updateGeometry(geometry: ParticleGeometry, config: particleMeshOptions): void;
/**
 * Update material with provided configs.
 * @param material Material to be updated.
 * @param config Config which will be applied on material.
 */
export declare function updateMaterial(material: ParticleMeshMaterial, config: particleMeshOptions): void;
/**
 * Update Material uniforms
 * @param material Material to be updated.
 */
export declare function updateOriginalMaterialUniforms(material: ParticleMeshMaterial): void;
/**
 * Update material time
 * @param material Material to be updated.
 * @param time Updated time.
 */
export declare function setMaterialTime(material: ParticleMeshMaterial, time: number): void;
/**
 * Load texture packer JSON file for provided mesh.
 * @param mesh Mesh for which texture packer JSON will be loaded.
 * @param config Configs.
 * @param startIndex Start index of the mesh geometry.
 * @param endIndex End index of the mesh geometry.
 */
export declare function loadTexturePackerJSON(mesh: any, config: any, startIndex: any, endIndex: any): void;
/**
 * Set texture atlas on material.
 * @param material Material of which texture atlas will be saved.
 * @param atlasJSON Atlas JSON to get texture atlas.
 */
export declare function setTextureAtlas(material: any, atlasJSON: any): void;
/**
 * Set matrix on geometry.
 * @param geometry Geometry for which matrix will be set.
 * @param i Index of geometry on which matrix will be set.
 * @param mat4 Matrix to be set on geometry.
 */
export declare function setMatrixAt(geometry: any, i: any, mat4: any): void;
/**
 * Set offset of geometry at provided index.
 * @param geometry Geometry for which offset will be set.
 * @param i Index of geometry on which offset will be set.
 * @param x
 * @param y
 * @param z
 */
export declare function setOffsetAt(geometry: any, i: number, x: number, y?: number, z?: number): void;
/**
 * Set color of geometry at provided index.
 * @param geometry Geometry for which color will be set.
 * @param i Index of geometry on which color will be set.
 * @param colorArray Color array to be set on geometry.
 */
export declare function setColorsAt(geometry: any, i: any, colorArray: any): void;
/**
 * Set opacity of geometry at provided index.
 * @param geometry Geometry for which opacity will be set.
 * @param i Index of geometry on which opacity will be set.
 * @param opacityArray Opacity array to be set on geometry.
 */
export declare function setOpacitiesAt(geometry: any, i: any, opacityArray: any): void;
/**
 * Set timings of geometry at provided index.
 * @param geometry Geometry for which timings will be set.
 * @param i Index of geometry on which timings will be set.
 */
export declare function setTimingsAt(geometry: any, i: any, spawnTime: any, lifeTime: any, repeatTime: any, seed?: number): void;
/**
 * Set frame of geometry at provided index.
 * @param geometry Geometry for which frame will be set.
 * @param i Index of geometry on which frame will be set.
 * @param atlasIndex Atlas index of frame.
 * @param frameStyle Style of the frame.
 * @param startFrame Start frame.
 * @param endFrame End frame.
 * @param cols Columns of the frame.
 * @param rows Rows of the frames.
 */
export declare function setFrameAt(geometry: any, i: any, atlasIndex: any, frameStyle: any, startFrame: any, endFrame: any, cols: any, rows: any): void;
/**
 * Set atlas index of geometry at provided index.
 * @param geometry Geometry for which atlas index will be set.
 * @param i Index of geometry on which atlas index will be set.
 * @param atlasIndex Atlas index to be set.
 */
export declare function setAtlasIndexAt(geometry: any, i: any, atlasIndex: any): void;
/**
 * Set scale of geometry at provided index.
 * @param geometry Geometry for which scale will be set.
 * @param i Index of geometry on which scale will be set.
 * @param scaleArray Scale to be set.
 */
export declare function setScalesAt(geometry: any, i: any, scaleArray: any): void;
/**
 * Set orientation of geometry at provided index.
 * @param geometry Geometry for which orientation will be set.
 * @param i Index of geometry on which orientation will be set.
 * @param orientationArray Orientation to be set.
 * @param worldUp Should Maintain world Up?
 */
export declare function setOrientationsAt(geometry: any, i: any, orientationArray: any, worldUp?: number): void;
/**
 * Set velocity of geometry at provided index.
 * @param geometry Geometry for which velocity will be set.
 * @param i Index of geometry on which velocity will be set.
 */
export declare function setVelocityAt(geometry: any, i: any, x: any, y: any, z: any, radial?: number): void;
/**
 * Set acceleration of geometry at provided index.
 * @param geometry Geometry for which acceleration will be set.
 * @param i Index of geometry on which acceleration will be set.
 */
export declare function setAccelerationAt(geometry: any, i: any, x: any, y: any, z: any, radial?: number): void;
/**
 * Set angular velocity of geometry at provided index.
 * @param geometry Geometry for which angular velocity will be set.
 * @param i Index of geometry on which angular velocity will be set.
 */
export declare function setAngularVelocityAt(geometry: any, i: any, x: any, y: any, z: any, orbital?: number): void;
/**
 * Set angular acceleration of geometry at provided index.
 * @param geometry Geometry for which angular acceleration will be set.
 * @param i Index of geometry on which angular acceleration will be set.
 */
export declare function setAngularAccelerationAt(geometry: any, i: any, x: any, y: any, z: any, orbital?: number): void;
/**
 * Set world acceleration of geometry at provided index.
 * @param geometry Geometry for which world acceleration will be set.
 * @param i Index of geometry on which world acceleration will be set.
 */
export declare function setWorldAccelerationAt(geometry: any, i: any, x: any, y: any, z: any): void;
/**
 * Set brownian speed and scale of geometry at provided index.
 * @param geometry Geometry for which brownian speed and scale will be set.
 * @param i Index of geometry on which brownian speed and scale will be set.
 * @param brownianSpeed Brownian speed to be set.
 * @param brownianScale Brownian scale to be set.
 */
export declare function setBrownianAt(geometry: any, i: any, brownianSpeed: any, brownianScale: any): void;
/**
 * Set velocity scale of geometry at provided index.
 * @param geometry Geometry for which velocity scale will be set.
 * @param i Index of geometry on which velocity scale will be set.
 * @param velocityScale Velocity scale to be applied.
 * @param velocityMin Minimum velocity to be applied.
 * @param velocityMax Maximum velocity to be applied.
 */
export declare function setVelocityScaleAt(geometry: any, i: any, velocityScale: any, velocityMin: any, velocityMax: any): void;
/**
 * Set Key frame of geometry at provided index.
 * @param geometry Geometry for which Key frame will be set.
 * @param i Index of geometry on which Key frame will be set.
 * @param valueArray Key frame to be applied.
 * @param defaultValue Default value of the frame.
 */
export declare function setKeyframesAt(attribute: any, i: any, valueArray: any, defaultValue: any): void;
/**
 * Set needsUpdate property of the geometry attributes.
 * @param geometry Geometry.
 * @param attrs List of attributes to be updated.
 */
export declare function needsUpdate(geometry: any, attrs?: any): void;
