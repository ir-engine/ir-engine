
export interface NetworkTransport {
  isServer: boolean;
  handleKick(socket: any);
  initialize(address?: string, port?: number, opts?: Object): void | Promise<void>;
  sendData(data: any): void;
  sendReliableData(data: any): void;
}
