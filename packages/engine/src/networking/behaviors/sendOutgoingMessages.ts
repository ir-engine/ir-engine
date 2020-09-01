import { Entity } from '../../ecs/classes/Entity';
import { getComponent } from '../../ecs/functions/EntityFunctions';
import { Network } from '../components/Network';
import { Behavior } from '../../common/interfaces/Behavior';

export const sendOutgoingMessages: Behavior = (entity: Entity) => {
  const networkComponent = getComponent(entity, Network);
  // For each message, send to all clients
};
