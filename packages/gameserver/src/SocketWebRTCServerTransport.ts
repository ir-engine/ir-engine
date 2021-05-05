import { MessageTypes } from "@xr3ngine/engine/src/networking/enums/MessageTypes";
import { handleNetworkStateUpdate } from "@xr3ngine/engine/src/networking/functions/updateNetworkState";
import { NetworkTransport } from "@xr3ngine/engine/src/networking/interfaces/NetworkTransport";
import config from '@xr3ngine/server-core/src/appconfig';
import { localConfig } from '@xr3ngine/server-core/src/config';
import logger from '@xr3ngine/server-core/src/logger';
import {
    cleanupOldGameservers,
    getFreeSubdomain,
    handleConnectToWorld,
    handleDisconnect,
    handleHeartbeat,
    handleIncomingMessage,
    handleJoinWorld,
    handleLeaveWorld,
    validateNetworkObjects
} from "@xr3ngine/gameserver/src/NetworkFunctions";
import { WebRtcTransportParams } from "@xr3ngine/server-core/src/types/WebRtcTransportParams";
import getLocalServerIp from '@xr3ngine/server-core/src/util/get-local-server-ip';
import AWS from 'aws-sdk';
import * as https from "https";
import { DataProducer, Router, Transport, Worker } from "mediasoup/lib/types";
import SocketIO, { Socket } from "socket.io";
import {
    handleWebRtcCloseConsumer,
    handleWebRtcCloseProducer,
    handleWebRtcConsumerSetLayers,
    handleWebRtcInitializeRouter,
    handleWebRtcPauseConsumer,
    handleWebRtcPauseProducer,
    handleWebRtcProduceData,
    handleWebRtcReceiveTrack,
    handleWebRtcRequestCurrentProducers,
    handleWebRtcResumeConsumer,
    handleWebRtcResumeProducer,
    handleWebRtcSendTrack,
    handleWebRtcTransportClose,
    handleWebRtcTransportConnect,
    handleWebRtcTransportCreate,
    startWebRTC
} from './WebRTCFunctions';

const gsNameRegex = /gameserver-([a-zA-Z0-9]{5}-[a-zA-Z0-9]{5})/;
const Route53 = new AWS.Route53({ ...config.aws.route53.keys });

function isNullOrUndefined<T>(obj: T | null | undefined): obj is null | undefined {
    return typeof obj === "undefined" || obj === null;
}

export class SocketWebRTCServerTransport implements NetworkTransport {
    server: https.Server
    socketIO: SocketIO.Server
    worker: Worker
    routers: Record<string, Router>
    transport: Transport
    app: any
    dataProducers: DataProducer[] = []
    outgoingDataTransport: Transport
    outgoingDataProducer: DataProducer
    gameServer;

    constructor(app) {
        this.app = app;
    }

    public sendReliableData = (message: any): any => {
        if (this.socketIO != null) this.socketIO.of('/realtime').emit(MessageTypes.ReliableMessage.toString(), message);
    }

    public sendNetworkStatUpdateMessage = (message: any): any => {
        if (this.socketIO != null) this.socketIO.of('/realtime').emit(MessageTypes.UpdateNetworkState.toString(), message);
    }

    toBuffer(ab): any {
        var buf = Buffer.alloc(ab.byteLength);
        var view = new Uint8Array(ab);
        for (var i = 0; i < buf.length; ++i) {
            buf[i] = view[i];
        }
        return buf;
    }

    public sendData = (data: any): void => {
        if (this.outgoingDataProducer != null) this.outgoingDataProducer.send(this.toBuffer(data));
    }

    public handleKick(socket: any): void {
        logger.info("Kicking ", socket.id);
        // TODO: Make sure this is right
        // logger.info(this.socketIO.allSockets()[socket.id]);
        if (this.socketIO != null) this.socketIO.of('/realtime').emit(MessageTypes.Kick.toString(), socket.id);
    }

    public async initialize(): Promise<void> {
        // Set up our gameserver according to our current environment
        const localIp = await getLocalServerIp();
        let stringSubdomainNumber, gsResult;
        if (process.env.KUBERNETES !== 'true') try {
            await this.app.service('instance').Model.destroy({where: {}});
        } catch (error) {
            logger.warn(error);
        }
        else if (process.env.KUBERNETES === 'true') {
            await cleanupOldGameservers();
            this.gameServer = await (this.app as any).agonesSDK.getGameServer();
            const name = this.gameServer.objectMeta.name;
            (this.app as any).gsName = name;

            const gsIdentifier = gsNameRegex.exec(name);
            stringSubdomainNumber = await getFreeSubdomain(gsIdentifier[1], 0);
            (this.app as any).gsSubdomainNumber = stringSubdomainNumber;

            gsResult = await (this.app as any).agonesSDK.getGameServer();
            const params = {
                ChangeBatch: {
                    Changes: [
                        {
                            Action: 'UPSERT',
                            ResourceRecordSet: {
                                Name: `${stringSubdomainNumber}.${config.gameserver.domain}`,
                                ResourceRecords: [{ Value: gsResult.status.address }],
                                TTL: 0,
                                Type: 'A'
                            }
                        }
                    ]
                },
                HostedZoneId: config.aws.route53.hostedZoneId
            };
            if (config.gameserver.local !== true) await Route53.changeResourceRecordSets(params).promise();
        }

        localConfig.mediasoup.webRtcTransport.listenIps = [{
            ip: '0.0.0.0',
            announcedIp: process.env.KUBERNETES === 'true' ?
                (config.gameserver.local === true ? gsResult.status.address :
                    `${stringSubdomainNumber}.${config.gameserver.domain}`) : localIp.ipAddress
        }];

        logger.info("Initializing WebRTC Connection");
        await startWebRTC();

        this.outgoingDataTransport = await this.routers.instance.createDirectTransport();
        const options = {
            ordered: false,
            label: 'outgoingProducer',
            protocol: 'raw',
            appData: { peerID: 'outgoingProducer' }
        };
        this.outgoingDataProducer = await this.outgoingDataTransport.produceData(options);

        setInterval(() => validateNetworkObjects(), 5000);

        // Set up realtime channel on socket.io
        this.socketIO = (this.app as any)?.io;

        if (this.socketIO != null) this.socketIO.of('/realtime').on("connect", (socket: Socket) => {
            // Authorize user and make sure everything is valid before allowing them to join the world
            socket.on(MessageTypes.Authorization.toString(), async (data, callback) => {
                // console.log('AUTHORIZATION CALL HANDLER', data.userId);
                const userId = data.userId;
                const accessToken = data.accessToken;

                // userId or access token were undefined, so something is wrong. Return failure
                if (isNullOrUndefined(userId) || isNullOrUndefined(accessToken)) {
                    const message = "userId or accessToken is undefined";
                    console.error(message);
                    callback({ success: false, message });
                    return;
                }

                // Check database to verify that user ID is valid
                const user = await this.app.service('user').Model.findOne({
                    attributes: ['id', 'name', 'instanceId', 'avatarId'],
                    where: {
                        id: userId
                    }
                }).catch(error => {
                    // They weren't found in the dabase, so send the client an error message and return
                    callback({ success: false, message: error });
                    return console.warn("Failed to authorize user");
                });

                // Check database to verify that user ID is valid
                const avatarResources = await this.app.service('static-resource').find({
                    query: {
                        $select: ['name', 'url', 'staticResourceType', 'userId'],
                        $or: [
                            { userId: null },
                            { userId: user.id },
                        ],
                        name: user.avatarId,
                        staticResourceType: {
                            $in: ['user-thumbnail', 'avatar'],
                        },
                    }
                }).catch(error => {
                    // They weren't found in the dabase, so send the client an error message and return
                    callback({ success: false, message: error });
                    return console.warn("Failed to authorize user");
                });

                const avatar = {
                    thumbnailURL: "",
                    avatarURL: "",
                    avatarId: 0
                } as any;
                avatarResources?.data.forEach(a => {
                    if (a.staticResourceType === 'avatar') avatar.avatarURL = a.url;
                    else avatar.thumbnailURL = a.url;
                    avatar.avatarId = a.name;
                });

                // TODO: Check that they are supposed to be in this instance
                // TODO: Check that token is valid (to prevent users hacking with a manipulated user ID payload)

                // Return an authorization success messaage to client
                callback({ success: true });

                socket.on(MessageTypes.ConnectToWorld.toString(), async (data, callback) => {
                    // console.log('Got ConnectToWorld:');
                    // console.log(data);
                    // console.log(userId);
                    // console.log("Avatar", avatar)
                    handleConnectToWorld(socket, data, callback, userId, user, avatar);
                });

                socket.on(MessageTypes.JoinWorld.toString(), async (data, callback) =>
                    handleJoinWorld(socket, data, callback, userId, user));

                // If a reliable message is received, add it to the queue
                socket.on(MessageTypes.ReliableMessage.toString(), (data) =>
                    handleIncomingMessage(socket, data));

                socket.on(MessageTypes.Heartbeat.toString(), () => handleHeartbeat(socket));

                socket.on("disconnect", () => handleDisconnect(socket));

                socket.on(MessageTypes.LeaveWorld.toString(), (data, callback) =>
                    handleLeaveWorld(socket, data, callback));

                socket.on(MessageTypes.WebRTCTransportCreate.toString(), async (data: WebRtcTransportParams, callback) =>
                    handleWebRtcTransportCreate(socket, data, callback));

                socket.on(MessageTypes.WebRTCProduceData.toString(), async (data, callback) =>
                    handleWebRtcProduceData(socket, data, callback));

                socket.on(MessageTypes.WebRTCTransportConnect.toString(), async (data, callback) =>
                    handleWebRtcTransportConnect(socket, data, callback));

                socket.on(MessageTypes.WebRTCTransportClose.toString(), async (data, callback) =>
                    handleWebRtcTransportClose(socket, data, callback));

                socket.on(MessageTypes.WebRTCCloseProducer.toString(), async (data, callback) =>
                    handleWebRtcCloseProducer(socket, data, callback));

                socket.on(MessageTypes.WebRTCSendTrack.toString(), async (data, callback) =>
                    handleWebRtcSendTrack(socket, data, callback));

                socket.on(MessageTypes.WebRTCReceiveTrack.toString(), async (data, callback) =>
                    handleWebRtcReceiveTrack(socket, data, callback));

                socket.on(MessageTypes.WebRTCPauseConsumer.toString(), async (data, callback) =>
                    handleWebRtcPauseConsumer(socket, data, callback));

                socket.on(MessageTypes.WebRTCResumeConsumer.toString(), async (data, callback) =>
                    handleWebRtcResumeConsumer(socket, data, callback));

                socket.on(MessageTypes.WebRTCCloseConsumer.toString(), async (data, callback) =>
                    handleWebRtcCloseConsumer(socket, data, callback));

                socket.on(MessageTypes.WebRTCConsumerSetLayers.toString(), async (data, callback) =>
                    handleWebRtcConsumerSetLayers(socket, data, callback));

                socket.on(MessageTypes.WebRTCResumeProducer.toString(), async (data, callback) =>
                    handleWebRtcResumeProducer(socket, data, callback));

                socket.on(MessageTypes.WebRTCPauseProducer.toString(), async (data, callback) =>
                    handleWebRtcPauseProducer(socket, data, callback));

                socket.on(MessageTypes.WebRTCRequestCurrentProducers.toString(), async (data, callback) =>
                    handleWebRtcRequestCurrentProducers(socket, data, callback));

                socket.on(MessageTypes.UpdateNetworkState.toString(), async (data) =>
                    handleNetworkStateUpdate(socket, data, true));

                socket.on(MessageTypes.InitializeRouter.toString(), async (data, callback) =>
                    handleWebRtcInitializeRouter(socket, data, callback));
            });
        });
    }
}