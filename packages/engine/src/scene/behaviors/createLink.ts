import { Object3D } from 'three';
import { Behavior } from '../../common/interfaces/Behavior';
import { EngineEvents } from '../../ecs/classes/EngineEvents';
import { addComponent, getComponent } from '../../ecs/functions/EntityFunctions';
import { Interactable } from '../../interaction/components/Interactable';
import { InteractiveSystem } from '../../interaction/systems/InteractiveSystem';
import { addObject3DComponent } from './addObject3DComponent';

export const createLink: Behavior = (entity, args: {
  obj3d;
  objArgs: any
}) => {
    addObject3DComponent(entity, { obj3d: new Object3D(), objArgs: args.objArgs });
    const interactiveData = {
      onInteraction: () => {
        window.open(args.objArgs.url);
      },
      onInteractionFocused: (entityInitiator, { focused }, delta, entityInteractive, time) => {
        EngineEvents.instance.dispatchEvent({ 
          type: InteractiveSystem.EVENTS.OBJECT_HOVER, 
          focused,
          interactionText: 'go to ' + args.objArgs.url
        });
      },
      data: { action: 'link' }
    };
    addComponent(entity, Interactable, interactiveData);
};
