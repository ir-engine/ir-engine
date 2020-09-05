import { Network } from '../components/Network';

export function connectToServer(ip: string, port: number) {
  Network.instance.transport.initialize(ip, port);
  Network.instance.isInitialized = true;
}
