export declare const Fly: {
    moveLeft: string;
    moveRight: string;
    moveX: string;
    moveForward: string;
    moveBackward: string;
    moveZ: string;
    lookX: string;
    lookY: string;
    moveDown: string;
    moveUp: string;
    moveY: string;
    boost: string;
};
export declare const Editor: {
    grab: string;
    focus: string;
    focusPosition: string;
    focusSelection: string;
    zoomDelta: string;
    enableFlyMode: string;
    disableFlyMode: string;
    flying: string;
    selecting: string;
    selectStart: string;
    selectStartPosition: string;
    selectEnd: string;
    selectEndPosition: string;
    cursorPosition: string;
    cursorDeltaX: string;
    cursorDeltaY: string;
    panning: string;
    setTranslateMode: string;
    setRotateMode: string;
    setScaleMode: string;
    toggleSnapMode: string;
    toggleTransformPivot: string;
    modifier: string;
    shift: string;
    toggleTransformSpace: string;
    deleteSelected: string;
    undo: string;
    redo: string;
    duplicateSelected: string;
    groupSelected: string;
    saveProject: string;
    cancel: string;
    rotateLeft: string;
    rotateRight: string;
    incrementGridHeight: string;
    decrementGridHeight: string;
};
export declare const FlyMapping: {
    keyboard: {
        pressed: {
            w: string;
            a: string;
            s: string;
            d: string;
            r: string;
            t: string;
            shift: string;
        };
    };
    mouse: {
        move: {
            normalizedMovementX: string;
            normalizedMovementY: string;
        };
    };
    computed: {
        transform: (input: any) => number;
        action: string;
    }[];
};
export declare const EditorMapping: {
    mouse: {
        dblclick: {
            event: {
                reset: boolean;
                defaultValue: boolean;
                handler: () => boolean;
                action: any;
            }[];
            position: string;
        };
        wheel: {
            normalizedDeltaY: string;
        };
        pressed: {
            left: string;
            middle: string;
            right: string;
        };
        mousedown: {
            event: {
                handler: (event: any, input: any) => void;
            }[];
            left: string;
            position: string;
            right: string;
        };
        mouseup: {
            event: {
                handler: (event: any, input: any) => void;
            }[];
            left: string;
            position: string;
            right: string;
        };
        move: {
            position: string;
            normalizedMovementX: string;
            normalizedMovementY: string;
        };
    };
    keyboard: {
        pressed: {
            mod: string;
            shift: string;
        };
        hotkeys: {
            "=": string;
            "-": string;
            f: string;
            t: string;
            r: string;
            y: string;
            q: string;
            e: string;
            g: string;
            z: string;
            x: string;
            c: string;
            backspace: string;
            del: string;
            "mod+z": string;
            "mod+shift+z": string;
            "mod+d": string;
            "mod+g": string;
            esc: string;
        };
        globalHotkeys: {
            "mod+s": string;
        };
    };
};
