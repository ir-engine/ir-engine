import { MessageTypeAlias } from '../types/MessageTypeAlias';
export interface Message {
  messageType: MessageTypeAlias;
  data: any;
}
