declare module '@capacitor/core' {
    interface PluginRegistry {
        XRPlugin: XRPluginPlugin;
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

/**
 * Enumerations for transcoding
 */
export const VideoEditorOptions = {
    OptimizeForNetworkUse: {
        NO: 0,
        YES: 1
    },
    OutputFileType: {
        M4V: 0,
        MPEG4: 1,
        M4A: 2,
        QUICK_TIME: 3
    }
};

    //output quailty
    enum VideoEditorQuality {
        HIGH_QUALITY,
        MEDIUM_QUALITY,
        LOW_QUALITY
    }
    //speed over quailty, maybe should be a bool
    enum VideoEditorOptimizeForNetworkUse {
        NO,
        YES
    }
    //type of encoding to do
    enum VideoEditorOutputFileType {
        M4V,
        MPEG4,
        M4A,
        QUICK_TIME
    }

/**
 * Transcode options that are required to reencode or change the coding of the video.
 */
export interface VideoEditorTranscodeProperties {
        /** A well-known location where the editable video lives. */
        fileUri: string,
        /** A string that indicates what type of field this is, home for example. */
        outputFileName: string,
        /** The quality of the result. */
        quality: VideoEditorQuality,
        /** Instructions on how to encode the video. */
        outputFileType: VideoEditorOutputFileType,
        /** Should the video be processed with quailty or speed in mind */
        optimizeForNetworkUse: VideoEditorOptimizeForNetworkUse,
        /** Not supported in windows, the duration in seconds from the start of the video*/
        duration?: number,
        /** Not supported in windows, save into the device library*/
        saveToLibrary?: boolean,
        /** Not supported in windows, delete the orginal video*/
        deleteInputFile?: boolean,
        /** iOS only. Defaults to true */
        maintainAspectRatio?: boolean,
        /** Width of the result */
        width?: number,
        /** Height of the result */
        height?: number,
        /** Bitrate in bits. Defaults to 1 megabit (1000000). */
        videoBitrate?: number,
        /** Frames per second of the result. Android only. Defaults to 24. */
        fps?: number,
        /** Number of audio channels. iOS only. Defaults to 2. */
        audioChannels?: number,
        /** Sample rate for the audio. iOS only. Defaults to 4410. */
        audioBitrate?: number,
        /** Not supported in windows, progress on the transcode*/
        progress?: (info: any) => void
}

/**
 * Trim options that are required to locate, reduce start/ end and save the video.
 */
export interface VideoEditorTrimProperties {
        /** A well-known location where the editable video lives. */
        fileUri: string,
        /** A number of seconds to trim the front of the video. */
        trimStart: number,
        /** A number of seconds to trim the front of the video. */
        trimEnd: number,
        /** A string that indicates what type of field this is, home for example. */
        outputFileName: string,
        /** Progress on transcode. */
        progress?: (info: any) => void
}

/**
 * Trim options that are required to locate, reduce start/ end and save the video.
 */
export interface VideoEditorThumbnailProperties {
        /** A well-known location where the editable video lives. */
        fileUri: string,
        /** A string that indicates what type of field this is, home for example. */
        outputFileName: string,
        /** Location in video to create the thumbnail (in seconds). */
        atTime?: number,
        /** Width of the thumbnail. */
        width?: number,
        /** Height of the thumbnail. */
        height?: number,
        /** Quality of the thumbnail (between 1 and 100). */
        quality?: number
}

export interface VideoEditorVideoInfoOptions {
        /** Path to the video on the device. */
        fileUri: string
}

export interface VideoEditorVideoInfoDetails {
        /** Width of the video. */
        width: number,
        /** Height of the video. */
        height: number,
        /** Orientation of the video. Will be either portrait or landscape. */
        orientation: 'portrait' | 'landscape',
        /** Duration of the video in seconds. */
        duration: number,
        /** Size of the video in bytes. */
        size: number,
        /** Bitrate of the video in bits per second. */
        bitrate: number
}

export interface XRPluginPlugin {
    initialize(options: {}): Promise<{ status: string; }>;

    start(options: CameraOptions): Promise<{}>;
    stop(): Promise<{}>;
    
    handleTap(): void;

    startRecording(
        isAudio: any,
        width: number,
        height: number,
        bitRate: number,
        dpi: number,
        filePath: string
    ): Promise<{ status: string; }>;

    stopRecording(options: {}): Promise<{ status: string; }>;

    getRecordingStatus(options: {}): Promise<{ status: string; }>;

    takePhoto(options: {}): Promise<{ status: string; }>;

    saveRecordingToVideo(options: {}): Promise<{ status: string; }>;

    shareMedia(options: {}): Promise<{ status: string; }>;

    showVideo(options: {}): Promise<{ status: string; }>;

    hideVideo(options: {}): Promise<{ status: string; }>;

    playVideo(options: {}): Promise<{ status: string; }>;
    
    pauseVideo(options: {}): Promise<{ status: string; }>;

    scrubTo(positionInTrack: number): Promise<{ status: string; }>;

    deleteVideo(options: {}): Promise<{ status: string; }>;

    saveVideoTo(options: {}): Promise<{ status: string; }>;

   transcodeVideo(options: VideoEditorTranscodeProperties): Promise<{ status: string, path: string; }>;

   trim(options: VideoEditorTrimProperties): Promise<{ status: string, path: string; }>;

   createThumbnail(options: VideoEditorThumbnailProperties): Promise<{ status: string, path: string; }>;

   getVideoInfo(options: VideoEditorVideoInfoDetails): Promise<{ info: VideoEditorVideoInfoOptions; }>;
}
