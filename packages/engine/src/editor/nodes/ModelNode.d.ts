declare const ModelNode_base: {
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
export default class ModelNode extends ModelNode_base {
    static nodeName: string;
    static legacyComponentName: string;
    static initialElementProps: {
        initialScale: string;
        src: string;
    };
    meshColliders: any[];
    static deserialize(editor: any, json: any, loadAsync: any, onError: any): Promise<{
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
    get src(): string;
    set src(value: string);
    loadGLTF(src: any): Promise<any>;
    load(src: any, onError?: any): Promise<this>;
    onAdd(): void;
    onRemove(): void;
    onPlay(): void;
    onPause(): void;
    onUpdate(dt: any): void;
    updateStaticModes(): void;
    serialize(): {
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
    copy(source: any, recursive?: boolean): this;
    prepareForExport(ctx: any): void;
}
export {};
