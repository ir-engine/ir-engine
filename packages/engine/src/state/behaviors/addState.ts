import { LifecycleValue } from '../../common/enums/LifecycleValue';
import { Behavior } from '../../common/interfaces/Behavior';
import { BinaryType } from '../../common/types/NumericalTypes';
import { Entity } from '../../ecs/classes/Entity';
import { State } from '../components/State';
import { StateType } from '../enums/StateType';
import { StateValue } from '../interfaces/StateValue';
import { StateAlias } from '../types/StateAlias';
import { getComponent } from '../../ecs/functions/EntityFunctions';


export const addState: Behavior = (entity: Entity, args: { state: StateAlias }): void => {
  const stateComponent = getComponent(entity, State);
  
  if(stateComponent === undefined){
    console.warn("WARNING: State component is undefined");
    return;
  } 

  if (stateComponent.data.has(args.state))
  return;

  const stateGroup = stateComponent.schema.states[args.state].group;
  stateComponent.data.set(args.state, {
    state: args.state,
    type: StateType.DISCRETE,
    lifecycleState: LifecycleValue.STARTED,
    group: stateComponent.schema.states[args.state].group
  } as StateValue<BinaryType>);

  // If state group is set to exclusive (XOR) then check if other states from state group are on
  if (stateComponent.schema.groups[stateGroup].exclusive) {
    stateComponent.data.forEach((value, key) => {
      console.log("key: ", key, " | args.state: ", args.state);
      if (key !== args.state && value.group === stateComponent.schema.states[args.state].group) {
        stateComponent.data.delete(key);
      }
    });
  }
};
