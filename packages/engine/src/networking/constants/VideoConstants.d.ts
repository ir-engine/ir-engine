export declare const VIDEO_CONSTRAINTS: {
    qvga: {
        width: {
            ideal: number;
        };
        height: {
            ideal: number;
        };
    };
    vga: {
        width: {
            ideal: number;
        };
        height: {
            ideal: number;
        };
    };
    hd: {
        width: {
            ideal: number;
        };
        height: {
            ideal: number;
        };
    };
};
export declare const localMediaConstraints: {
    audio: boolean;
    video: {
        width: {
            ideal: number;
        };
        height: {
            ideal: number;
        };
        frameRate: {
            max: number;
        };
    };
};
export declare const CAM_VIDEO_SIMULCAST_ENCODINGS: {
    maxBitrate: number;
    scaleResolutionDownBy: number;
}[];
