import { Behavior } from '../../common/interfaces/Behavior';
import { addComponent,getMutableComponent } from '../../ecs/functions/EntityFunctions';
import ShadowComponent from '../components/ShadowComponent';

export const createShadow: Behavior = (entity, args: { objArgs: { castShadow: boolean, receiveShadow: boolean}}) => {
    addComponent(entity, ShadowComponent);
    const component = getMutableComponent(entity, ShadowComponent)
    component.castShadow = args.objArgs.castShadow || false
    component.receiveShadow = args.objArgs.receiveShadow  || false
};
