export interface NetworkTransport {
  initialize(address?: string, port?: number): void | Promise<void>
  sendAllReliableMessages(): void
}
