declare module '@capacitor/core' {
    interface PluginRegistry {
        XRPlugin: XRPluginInterface;
    }
}

interface Vector3 {
    x: number,
    y: number,
    z: number
}

interface Quaternion {
    x: number,
    y: number,
    z: number,
    w: number
}

export interface XRFrameData {
    hasData: boolean,
    cameraPosition?: Vector3,
    cameraRotation?: Quaternion,
    stagePosition?: Vector3,
    stageRotation?: Quaternion
}

export type CameraPosition = 'rear' | 'front';
export interface CameraOptions {
  /** Parent element to attach the video preview element to (applicable to the web platform only) */
  parent?: string;
  /** Class name to add to the video preview element (applicable to the web platform only) */
  className?: string;
  /** The preview width in pixels, default window.screen.width (applicable to the android and ios platforms only) */
  width?: number;
  /** The preview height in pixels, default window.screen.height (applicable to the android and ios platforms only) */
  height?: number;
  /** The x origin, default 0 (applicable to the android and ios platforms only) */
  x?: number;
  /** The y origin, default 0 (applicable to the android and ios platforms only) */
  y?: number;
  /**  Brings your html in front of your preview, default false (applicable to the android only) */
  toBack?: boolean;
  /** The preview bottom padding in pixes. Useful to keep the appropriate preview sizes when orientation changes (applicable to the android and ios platforms only) */
  paddingBottom?: number;
  /** Rotate preview when orientation changes (applicable to the ios platforms only; default value is true) */
  rotateWhenOrientationChanged?: boolean;
  /** Choose the camera to use 'front' or 'rear', default 'front' */
  position?: CameraPosition | string;
  /** Defaults to false - Capture images to a file and return back the file path instead of returning base64 encoded data */
  storeToFile?: boolean;
  /** Defaults to false - Android Only - Disable automatic rotation of the image, and let the browser deal with it (keep reading on how to achieve it) */
  disableExifHeaderStripping?: boolean;
  /** Defaults to false - iOS only - Activate high resolution image capture so that output images are from the highest resolution possible on the device **/
  enableHighResolution?: boolean;
  /** Defaults to false - Web only - Disables audio stream to prevent permission requests and output switching */
  disableAudio?: boolean;
}
export interface XRPluginInterface {
    initialize(options: {}): Promise<{ status: string; }>;

    start(options: CameraOptions): Promise<{}>;
    stop(): Promise<{}>;
    flip(): void;

    startXR(options: {}): Promise<{ status: string;}>;

    stopXR(options: {}): Promise<{ status: string;}>;

    getXRDataForFrame(options: {}): Promise<{ data: XRFrameData;}>;

    startRecording(options: {}): Promise<{ status: string; }>;

    stopRecording(options: {}): Promise<{ status: string; }>;

    getRecordingStatus(options: {}): Promise<{ status: string; }>;

    takePhoto(options: {}): Promise<{ status: string; }>;

    saveRecordingToVideo(options: {}): Promise<{ status: string; }>;

    shareMedia(options: {}): Promise<{ status: string; }>;

    showVideo(options: {}): Promise<{ status: string; }>;

    hideVideo(options: {}): Promise<{ status: string; }>;

    scrubTo(options: {}): Promise<{ status: string; }>;

    deleteVideo(options: {}): Promise<{ status: string; }>;

    saveVideoTo(options: {}): Promise<{ status: string; }>;
}