/// <reference types="socket.io-client" />
export declare function promise(socket: SocketIOClient.Socket): (type: any, data?: {}) => Promise<unknown>;
