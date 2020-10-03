import { Behavior } from '../../common/interfaces/Behavior';
import { Entity } from '../../ecs/classes/Entity';
import { getComponent } from '../../ecs/functions/EntityFunctions';
import { Network } from '../components/Network';
import { applyWorldState } from './applyWorldState';

export const handleUpdateFromServer: Behavior = (entity: Entity, args: null, delta) => {
  const queue = Network.instance.incomingMessageQueue;
  // For each message, handle and process
  while (queue.getBufferLength() > 0) {
    const message = queue.pop();
    // Buffer to object
    applyWorldState(message, delta);
  }
};
