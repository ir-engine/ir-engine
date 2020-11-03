import { Network } from '../components/Network';

export async function connectToServer(ip: string, port: number, opts?: Object) {
  console.log("*** CONNECT TO SERVER");
  Network.instance.transport.initialize(ip, port, opts);
  Network.instance.isInitialized = true;
}
