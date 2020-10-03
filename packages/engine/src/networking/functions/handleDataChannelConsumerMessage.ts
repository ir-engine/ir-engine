import { DataConsumer } from 'mediasoup-client/lib/types';
import { Network } from '../components/Network';

export default (
  dataConsumer: DataConsumer
) => (message: any) => {
  console.log("UNRELIABLE MESSAGE: " + message);
  // switch on channel, probably use sort of an enums just like MessageTypes for the cases
  switch (dataConsumer.label) {
    // example
    // case 'physics'
    // DO STUFF
    // case 'location'
    // DO STUFF
    // case 'default':
    //   // DO STUFF ON DEFAULT CHANNEL HERE
    //   console.warn('Default Channel got unreliable message on it!', message)
    //   break
    default:
      Network.instance.incomingMessageQueue.add(message);
  }
};
