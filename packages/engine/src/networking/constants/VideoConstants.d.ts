/** VIDEO_CONSTRAINTS is video quality levels. */
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
/** localMediaConstraints is passed to the getUserMedia object to request a lower video quality than the maximum. */
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
/**
 * Encodings for outgoing video.\
 * Just two resolutions, for now, as chrome 75 seems to ignore more
 * than two encodings.
 */
export declare const CAM_VIDEO_SIMULCAST_ENCODINGS: {
    maxBitrate: number;
    scaleResolutionDownBy: number;
}[];
