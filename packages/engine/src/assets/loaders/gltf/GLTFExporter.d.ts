declare class GLTFExporter {
    options: any;
    outputJSON: {
        asset: {
            version: string;
            generator: string;
        };
    };
    outputBuffers: any[];
    outputImages: any[];
    byteOffset: number;
    buffers: any[];
    pending: any[];
    nodeMap: Map<any, any>;
    skins: any[];
    extensionsUsed: {};
    cachedData: any;
    cachedCanvas: any;
    uids: Map<any, any>;
    uid: number;
    extensions: any[];
    hooks: any[];
    static Utils: any;
    constructor(options: any);
    registerExtension(Extension: any, options?: {}): void;
    addHook(hookName: any, test: any, callback: any): void;
    runFirstHook(hookName: any, ...args: any[]): Promise<any>;
    runAllHooks(hookName: any, ...args: any[]): Promise<any[]>;
    /**
     * Assign and return a temporal unique id for an object
     * especially which doesn't have .uuid
     * @param  {Object} object
     * @return {Integer}
     */
    getUID(object: any): any;
    /**
     * Checks if normal attribute values are normalized.
     *
     * @param {BufferAttribute} normal
     * @returns {Boolean}
     *
     */
    isNormalizedNormalAttribute(normal: any): boolean;
    /**
     * Creates normalized normal buffer attribute.
     *
     * @param {BufferAttribute} normal
     * @returns {BufferAttribute}
     *
     */
    createNormalizedNormalAttribute(normal: any): any;
    /**
     * Serializes a userData.
     *
     * @param {THREE.Object3D|THREE.Material} object
     * @param {Object} gltfProperty
     */
    serializeUserData(object: any, gltfProperty: any): void;
    serializeUserDataProperty(value: any): any;
    /**
     * Applies a texture transform, if present, to the map definition. Requires
     * the KHR_texture_transform extension.
     */
    applyTextureTransform(mapDef: any, texture: any): void;
    /**
     * Process a buffer to append to the default one.
     * @param  {ArrayBuffer} buffer
     * @return {Integer}
     */
    processBuffer(buffer: any): number;
    /**
     * Process and generate a BufferView
     * @param  {BufferAttribute} attribute
     * @param  {number} componentType
     * @param  {number} start
     * @param  {number} count
     * @param  {number} target (Optional) Target usage of the BufferView
     * @return {Object}
     */
    processBufferView(attribute: any, componentType: any, start: any, count: any, target: any): {
        id: number;
        byteLength: number;
    };
    /**
     * Process and generate a BufferView from an image Blob.
     * @param {Blob} blob
     * @return {Promise<Integer>}
     */
    processBufferViewImage(blob: any): Promise<unknown>;
    /**
     * Process attribute to generate an accessor
     * @param  {BufferAttribute} attribute Attribute to process
     * @param  {BufferGeometry} geometry (Optional) Geometry used for truncated draw range
     * @param  {Integer} start (Optional)
     * @param  {Integer} count (Optional)
     * @return {Integer}           Index of the processed accessor on the "accessors" array
     */
    processAccessor(attribute: any, geometry: any, start?: any, count?: any): number;
    transformImage(image: any, mimeType: any, flipY: any): Promise<{
        blob: unknown;
        src: any;
        width: any;
        height: any;
    }>;
    /**
     * Process image
     * @param  {Image} image to process
     * @param  {Integer} format of the image (e.g. THREE.RGBFormat, RGBAFormat etc)
     * @param  {Boolean} flipY before writing out the image
     * @return {Integer}     Index of the processed texture in the "images" array
     */
    processImage(image: any, format: any, dataTexture: any, flipY: any, name: any): any;
    /**
     * Process sampler
     * @param  {Texture} map Texture to process
     * @return {Integer}     Index of the processed texture in the "samplers" array
     */
    processSampler(map: any): number;
    /**
     * Process texture
     * @param  {Texture} map Map to process
     * @return {Integer}     Index of the processed texture in the "textures" array
     */
    processTexture(map: any, dataTexture?: any): any;
    /**
     * Process material
     * @param  {THREE.Material} material Material to process
     * @return {Integer}      Index of the processed material in the "materials" array
     */
    processMaterial(material: any): any;
    /**
     * Process mesh
     * @param  {THREE.Mesh} mesh Mesh to process
     * @return {Integer}      Index of the processed mesh in the "meshes" array
     */
    processMesh(mesh: any): any;
    /**
     * Creates glTF animation entry from AnimationClip object.
     *
     * Status:
     * - Only properties listed in PATH_PROPERTIES may be animated.
     *
     * @param {THREE.AnimationClip} clip
     * @param {THREE.Object3D} root
     * @return {number}
     */
    processAnimation(clip: any, root: any): number;
    processSkin(object: any): number;
    /**
     * Process Object3D node
     * @param  {THREE.Object3D} node Object3D to processNode
     * @return {Integer}      Index of the node in the nodes list
     */
    processNode(object: any): number;
    /**
     * Process Scene
     * @param  {Scene} node Scene to process
     */
    processScene(scene: any): number;
    processInput(input: any): void;
    processObjects(objectsWithoutScene: any[]): void;
    postProcessBuffers(): void;
    exportChunks(input: any): Promise<{
        json: {
            asset: {
                version: string;
                generator: string;
            };
        };
        buffers: any[];
        images: any[];
    }>;
    /**
     * Given a chunks object returned by GLTFLoader.parseChunks, create a blob storing a valid .glb.
     * @param  {Object} chunks  chunks object returned by GLTFLoader.parseChunks
     * @param  {Function} onDone  Callback on completed
     * @param  {Function} onError  Callback on error
     */
    exportGLBBlob(chunks: any): Promise<Blob>;
}
export { GLTFExporter };
