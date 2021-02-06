declare const DirectionalLightNode_base: {
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
export default class DirectionalLightNode extends DirectionalLightNode_base {
    static legacyComponentName: string;
    static nodeName: string;
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
    onAdd(): void;
    onChange(): void;
    onSelect(): void;
    onDeselect(): void;
    copy(source: any, recursive?: boolean): this;
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
    prepareForExport(): void;
}
export {};
