import { UnreliableMessageType } from "@xr3ngine/engine/src/networking/types/NetworkingTypes";
import { DataProducer, Transport as MediaSoupTransport } from "mediasoup-client/lib/types";
export declare function createDataProducer(channel?: string, type?: UnreliableMessageType, customInitInfo?: any): Promise<DataProducer | Error>;
export declare function initReceiveTransport(channelType: string, channelId?: string): Promise<MediaSoupTransport | Error>;
export declare function initSendTransport(channelType: string, channelId?: string): Promise<MediaSoupTransport | Error>;
export declare function configureMediaTransports(channelType: any, channelId?: string): Promise<void>;
export declare function createCamVideoProducer(channelType: string, channelId?: string): Promise<void>;
export declare function createCamAudioProducer(channelType: string, channelId?: string): Promise<void>;
export declare function endVideoChat(options: {
    leftParty?: boolean;
    endConsumers?: boolean;
}): Promise<boolean>;
export declare function resetProducer(): void;
export declare function setRelationship(channelType: string, channelId: string): void;
export declare function subscribeToTrack(peerId: string, mediaTag: string, channelType: string, channelId: string): Promise<void>;
export declare function unsubscribeFromTrack(peerId: any, mediaTag: any): Promise<void>;
export declare function pauseConsumer(consumer: {
    appData: {
        peerId: any;
        mediaTag: any;
    };
    id: any;
    pause: () => any;
}): Promise<void>;
export declare function resumeConsumer(consumer: {
    appData: {
        peerId: any;
        mediaTag: any;
    };
    id: any;
    resume: () => any;
}): Promise<void>;
export declare function pauseProducer(producer: {
    appData: {
        mediaTag: any;
    };
    id: any;
    pause: () => any;
}): Promise<void>;
export declare function globalMuteProducer(producer: {
    id: any;
}): Promise<void>;
export declare function resumeProducer(producer: {
    appData: {
        mediaTag: any;
    };
    id: any;
    resume: () => any;
}): Promise<void>;
export declare function globalUnmuteProducer(producer: {
    id: any;
}): Promise<void>;
export declare function closeConsumer(consumer: any): Promise<void>;
export declare function createTransport(direction: string, channelType?: string, channelId?: string): Promise<any>;
export declare function leave(): Promise<boolean>;
