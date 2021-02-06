declare const SceneNode_base: {
    new (editor: any, ...args: any[]): {
        [x: string]: any;
        clone(recursive: any): any;
        copy(source: any, recursive?: boolean): any;
        onPlay(): void;
        onUpdate(dt: any): void;
        onPause(): void;
        onAdd(): void;
        onChange(): void;
        onRemove(): void;
        onSelect(): void;
        onDeselect(): void;
        onRendererChanged(): void;
        serialize(components: any): {
            name: any;
            components: ({
                name: string;
                props: {
                    position: {
                        x: any;
                        y: any;
                        z: any;
                    };
                    rotation: {
                        x: any;
                        y: any;
                        z: any;
                    };
                    scale: {
                        x: any;
                        y: any;
                        z: any;
                    };
                    visible?: undefined;
                };
            } | {
                name: string;
                props: {
                    visible: any;
                    position?: undefined;
                    rotation?: undefined;
                    scale?: undefined;
                };
            })[];
        };
        prepareForExport(): void;
        addGLTFComponent(name: any, props?: any): void;
        replaceObject(replacementObject?: any): void;
        gltfIndexForUUID(nodeUUID: any): {
            __gltfIndexForUUID: any;
        };
        getObjectByUUID(uuid: any): any;
        computeStaticMode(): any;
        computeAndSetStaticModes(): void;
        computeAndSetVisible(): void;
        showLoadingCube(): void;
        hideLoadingCube(): void;
        showErrorIcon(): void;
        hideErrorIcon(): void;
        isInherits(): boolean;
        isStatic(): boolean;
        isDynamic(): boolean;
        findNodeByType(nodeType: any): any;
        getNodesByType(nodeType: any): any[];
        getRuntimeResourcesForStats(): void;
    };
    [x: string]: any;
    nodeName: string;
    disableTransform: boolean;
    useMultiplePlacementMode: boolean;
    ignoreRaycast: boolean;
    initialElementProps: {};
    hideInElementsPanel: boolean;
    canAddNode(_editor: any): boolean;
    load(): Promise<void>;
    shouldDeserialize(entityJson: any): boolean;
    deserialize(editor: any, json: any): Promise<{
        [x: string]: any;
        clone(recursive: any): any;
        copy(source: any, recursive?: boolean): any;
        onPlay(): void;
        onUpdate(dt: any): void;
        onPause(): void;
        onAdd(): void;
        onChange(): void;
        onRemove(): void;
        onSelect(): void;
        onDeselect(): void;
        onRendererChanged(): void;
        serialize(components: any): {
            name: any;
            components: ({
                name: string;
                props: {
                    position: {
                        x: any;
                        y: any;
                        z: any;
                    };
                    rotation: {
                        x: any;
                        y: any;
                        z: any;
                    };
                    scale: {
                        x: any;
                        y: any;
                        z: any;
                    };
                    visible?: undefined;
                };
            } | {
                name: string;
                props: {
                    visible: any;
                    position?: undefined;
                    rotation?: undefined;
                    scale?: undefined;
                };
            })[];
        };
        prepareForExport(): void;
        addGLTFComponent(name: any, props?: any): void;
        replaceObject(replacementObject?: any): void;
        gltfIndexForUUID(nodeUUID: any): {
            __gltfIndexForUUID: any;
        };
        getObjectByUUID(uuid: any): any;
        computeStaticMode(): any;
        computeAndSetStaticModes(): void;
        computeAndSetVisible(): void;
        showLoadingCube(): void;
        hideLoadingCube(): void;
        showErrorIcon(): void;
        hideErrorIcon(): void;
        isInherits(): boolean;
        isStatic(): boolean;
        isDynamic(): boolean;
        findNodeByType(nodeType: any): any;
        getNodesByType(nodeType: any): any[];
        getRuntimeResourcesForStats(): void;
    }>;
};
export default class SceneNode extends SceneNode_base {
    static nodeName: string;
    static disableTransform: boolean;
    static canAddNode(): boolean;
    static loadProject(editor: any, json: any): Promise<any[]>;
    static shouldDeserialize(entityJson: any): boolean;
    static deserialize(editor: any, json: any): Promise<{
        [x: string]: any;
        clone(recursive: any): any;
        copy(source: any, recursive?: boolean): any;
        onPlay(): void;
        onUpdate(dt: any): void;
        onPause(): void;
        onAdd(): void;
        onChange(): void;
        onRemove(): void;
        onSelect(): void;
        onDeselect(): void;
        onRendererChanged(): void;
        serialize(components: any): {
            name: any;
            components: ({
                name: string;
                props: {
                    position: {
                        x: any;
                        y: any;
                        z: any;
                    };
                    rotation: {
                        x: any;
                        y: any;
                        z: any;
                    };
                    scale: {
                        x: any;
                        y: any;
                        z: any;
                    };
                    visible?: undefined;
                };
            } | {
                name: string;
                props: {
                    visible: any;
                    position?: undefined;
                    rotation?: undefined;
                    scale?: undefined;
                };
            })[];
        };
        prepareForExport(): void;
        addGLTFComponent(name: any, props?: any): void;
        replaceObject(replacementObject?: any): void;
        gltfIndexForUUID(nodeUUID: any): {
            __gltfIndexForUUID: any;
        };
        getObjectByUUID(uuid: any): any;
        computeStaticMode(): any;
        computeAndSetStaticModes(): void;
        computeAndSetVisible(): void;
        showLoadingCube(): void;
        hideLoadingCube(): void;
        showErrorIcon(): void;
        hideErrorIcon(): void;
        isInherits(): boolean;
        isStatic(): boolean;
        isDynamic(): boolean;
        findNodeByType(nodeType: any): any;
        getNodesByType(nodeType: any): any[];
        getRuntimeResourcesForStats(): void;
    }>;
    constructor(editor: any);
    get fogType(): any;
    set fogType(type: any);
    get fogColor(): any;
    get fogDensity(): any;
    set fogDensity(value: any);
    get fogNearDistance(): any;
    set fogNearDistance(value: any);
    get fogFarDistance(): any;
    set fogFarDistance(value: any);
    get environmentMap(): any;
    updateEnvironmentMap(environmentMap: any): void;
    copy(source: any, recursive?: boolean): this;
    serialize(): {
        version: number;
        root: any;
        metadata: any;
        entities: {
            [x: number]: {
                name: any;
                components: ({
                    name: string;
                    props: {
                        type: any;
                        color: string;
                        near: any;
                        far: any;
                        density: any;
                        overrideAudioSettings?: undefined;
                        avatarDistanceModel?: undefined;
                        avatarRolloffFactor?: undefined;
                        avatarRefDistance?: undefined;
                        avatarMaxDistance?: undefined;
                        mediaVolume?: undefined;
                        mediaDistanceModel?: undefined;
                        mediaRolloffFactor?: undefined;
                        mediaRefDistance?: undefined;
                        mediaMaxDistance?: undefined;
                        mediaConeInnerAngle?: undefined;
                        mediaConeOuterAngle?: undefined;
                        mediaConeOuterGain?: undefined;
                    };
                } | {
                    name: string;
                    props: {
                        overrideAudioSettings: any;
                        avatarDistanceModel: any;
                        avatarRolloffFactor: any;
                        avatarRefDistance: any;
                        avatarMaxDistance: any;
                        mediaVolume: any;
                        mediaDistanceModel: any;
                        mediaRolloffFactor: any;
                        mediaRefDistance: any;
                        mediaMaxDistance: any;
                        mediaConeInnerAngle: any;
                        mediaConeOuterAngle: any;
                        mediaConeOuterGain: any;
                        type?: undefined;
                        color?: undefined;
                        near?: undefined;
                        far?: undefined;
                        density?: undefined;
                    };
                })[];
            };
        };
    };
    prepareForExport(ctx: any): void;
    combineMeshes(): Promise<void>;
    removeUnusedObjects(): void;
    getAnimationClips(): any[];
    getContentAttributions(): any[];
    clearMetadata(): void;
    setMetadata(newMetadata: any): void;
}
export {};
