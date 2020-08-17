export interface NetworkTransport {
    initialize(address?: string, port?: number): void | Promise<void>;
    sendAllReliableMessages(): void;
    sendUnreliableMessage(params: any): Promise<any>;
    sendAllUnReliableMessages(): void;
}
