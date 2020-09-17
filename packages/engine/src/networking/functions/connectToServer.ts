import { Network } from '../components/Network';

export function connectToServer(ip: string, port: number) {
  console.log("*** CONNECT TO SERVER")
  Network.instance.transport.initialize(ip, port);
  Network.instance.isInitialized = true;
}
