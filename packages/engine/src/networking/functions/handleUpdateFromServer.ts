import _ from 'lodash';
import { Behavior } from '../../common/interfaces/Behavior';
import { Entity } from '../../ecs/classes/Entity';
import { getComponent } from '../../ecs/functions/EntityFunctions';
import { Network } from '../components/Network';
import { applyWorldState } from './applyWorldState';

let lastMessage

export const handleUpdateFromServer: Behavior = (entity: Entity, args: null, delta) => {
  const queue = Network.instance.incomingMessageQueue;
  // For each message, handle and process
  while (queue.getBufferLength() > 0) {
    const message = queue.pop();
    applyWorldState(message, delta);
    // if(_.isEqual(lastMessage, message["inputs"]))
    //   return
    // lastMessage = message["inputs"];
    // console.log("MESSAGE", message);
    // Buffer to object
  }
};
