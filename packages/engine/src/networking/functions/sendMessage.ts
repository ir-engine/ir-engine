import { Network } from '../components/Network';
import { MessageChannel } from '../enums/MessageChannel';
import { MessageTypeAlias } from '../types/MessageTypeAlias';

/**
 * Send a message over the network
 * @param messageChannel Are we sending this message reliably (socket.io) or unreliably? (SCTP on UDP)
 * @param messageData Data to be sent, packed into a typed buffer array
 * @param messageType What type of message is this? Will determine how it is parsed (reliable only)
 */

export const sendMessage = (messageChannel: MessageChannel, messageData: any, messageType?: MessageTypeAlias): void => {
  switch (messageChannel) {
    case MessageChannel.Reliable:
      Network.instance.transport.sendReliableMessage({ channel: messageType.toString(), data: messageData });
    case MessageChannel.Unreliable:
      Network.instance.transport.sendUnreliableMessage(messageData); // Use default channel
  }
};
