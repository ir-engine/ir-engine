import { Network } from '../components/Network';
import { MessageChannel } from '../enums/MessageChannel';
import { SendMessageTypeDetail } from '../types/NetworkingTypes';

/**
 * Send a message over the network
 * @param messageChannel Are we sending this message reliably (socket.io) or unreliably? (SCTP on UDP)
 * @param messageData Data to be sent, packed into a typed buffer array
 * @param SendMessageTypeDetail - type defines What type of message is this? Will determine how it is parsed (reliable only), unreliableChannel prop determines what data channel is this to be sent to?
 */

export const sendMessage = (messageChannel: MessageChannel, messageData: any, messageTypeDetail?: SendMessageTypeDetail): void => {
  switch (messageChannel) {
    case MessageChannel.Reliable:
      Network.instance.transport.sendReliableMessage({ channel: messageTypeDetail.type.toString(), data: messageData });
    case MessageChannel.Unreliable:
      Network.instance.transport.sendUnreliableMessage(messageData, messageTypeDetail.unreliableChannel); // Use default channel
  }
};