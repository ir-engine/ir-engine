export default interface NetworkTransport {
    supportsMediaStreams: boolean;
    initialize(address: string, port: number): void;
    sendAllReliableMessages(): void;
}
