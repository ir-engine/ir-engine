export default class PlayModeControls {
    inputManager: any;
    editorControls: any;
    flyControls: any;
    enabled: boolean;
    constructor(inputManager: any, editorControls: any, flyControls: any);
    enable(): void;
    disable(): void;
    onClickCanvas: () => void;
    onPointerLockChange: () => void;
}
