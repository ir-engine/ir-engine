import * as mediasoup from "mediasoup";
export declare const config: {
    httpPeerStale: number;
    mediasoup: {
        worker: {
            rtcMinPort: number;
            rtcMaxPort: number;
            logLevel: string;
            logTags: string[];
        };
        router: {
            mediaCodecs: ({
                kind: mediasoup.types.MediaKind;
                mimeType: string;
                clockRate: number;
                channels: number;
                parameters?: undefined;
            } | {
                kind: mediasoup.types.MediaKind;
                mimeType: string;
                clockRate: number;
                parameters: {
                    "packetization-mode"?: undefined;
                    "profile-level-id"?: undefined;
                    "level-asymmetry-allowed"?: undefined;
                };
                channels?: undefined;
            } | {
                kind: mediasoup.types.MediaKind;
                mimeType: string;
                clockRate: number;
                parameters: {
                    "packetization-mode": number;
                    "profile-level-id": string;
                    "level-asymmetry-allowed": number;
                };
                channels?: undefined;
            })[];
        };
        webRtcTransport: {
            listenIps: {
                ip: string;
                announcedIp: any;
            }[];
            initialAvailableOutgoingBitrate: number;
        };
    };
};
